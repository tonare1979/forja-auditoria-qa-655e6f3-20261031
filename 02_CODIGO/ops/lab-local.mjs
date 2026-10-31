// Local-only harness: unchanged production Worker + SQLite D1-shaped adapter.
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {randomBytes,pbkdf2Sync,createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/index.js';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const credentials={username:'qa_local',password:'ForjaLocal!2026'};
export async function createLab({port=8790,directory=path.join(os.homedir(),'FORJA_LAB_SINTETICO_20261028')}={}){
  fs.mkdirSync(directory,{recursive:true});
  const configPath=path.join(directory,'lab-config.json');
  if(!fs.existsSync(configPath))fs.writeFileSync(configPath,JSON.stringify({pepper:randomBytes(48).toString('hex')}),{mode:0o600,flag:'wx'});
  const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
  const sql=new DatabaseSync(path.join(directory,'laboratorio.sqlite'));
  sql.exec('PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS lab_migrations(name TEXT PRIMARY KEY)');
  for(const name of fs.readdirSync(path.join(project,'migrations')).filter(n=>n.endsWith('.sql')).sort()){
    if(sql.prepare('SELECT name FROM lab_migrations WHERE name=?').get(name))continue;
    sql.exec('BEGIN');
    try{sql.exec(fs.readFileSync(path.join(project,'migrations',name),'utf8'));sql.prepare('INSERT INTO lab_migrations VALUES(?)').run(name);sql.exec('COMMIT');}
    catch(e){sql.exec('ROLLBACK');throw e;}
  }
  for(const username of [credentials.username,'qa_outro']){
    if(sql.prepare('SELECT id FROM users WHERE username=?').get(username))continue;
    const salt=randomBytes(16).toString('hex');
    const proof=pbkdf2Sync(credentials.password,Buffer.from(salt,'hex'),210000,32,'sha256').toString('hex');
    const hash=createHmac('sha256',config.pepper).update(proof).digest('hex');
    sql.prepare("INSERT INTO users(id,username,display_name,role,password_salt,password_hash,created_at,status,email) VALUES(?,?,?,'member',?,?,?,'active',?)").run('lab-'+username,username,'Atleta sintético '+username,salt,hash,Math.floor(Date.now()/1000),username+'@example.invalid');
  }
  class Statement{
    constructor(query,args=[]){this.query=query;this.args=args;}
    bind(...args){return new Statement(this.query,args);}
    async first(column){const row=sql.prepare(this.query).get(...this.args);return row?(column?row[column]:row):null;}
    async all(){return {success:true,results:sql.prepare(this.query).all(...this.args)};}
    execute(){const r=sql.prepare(this.query).run(...this.args);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}
    async run(){return this.execute();}
  }
  const db={prepare:q=>new Statement(q),async batch(statements){sql.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>s.execute());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
  const publicRoot=path.join(project,'public');
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
  const assets={async fetch(req){
    const name=decodeURIComponent(new URL(req.url).pathname);
    const file=path.resolve(publicRoot,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(publicRoot+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response('Not found',{status:404});
    const headers={'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'};
    const csp=fs.readFileSync(path.join(publicRoot,'_headers'),'utf8').match(/Content-Security-Policy: ([^\r\n]+)/)?.[1];
    if(csp)headers['content-security-policy']=csp;
    return new Response(fs.readFileSync(file),{headers});
  }};
  const env={DB:db,ASSETS:assets,FORJA_AUTH_PEPPER:config.pepper};
  let origin;
  // Deliberately synthetic localhost-only certificate; never install as a CA.
  const tls=path.join(project,'ops/lab-local-tls');
  const server=https.createServer({key:fs.readFileSync(path.join(tls,'localhost.key')),cert:fs.readFileSync(path.join(tls,'localhost.crt'))},async(req,res)=>{
    if(req.headers.host!==new URL(origin).host){res.writeHead(403);return res.end('Loopback host only');}
    try{
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>1500000){res.writeHead(413);return res.end();}chunks.push(chunk);}
      const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);}
      headers.set('CF-Connecting-IP','127.0.0.1');
      const request=new Request(new URL(req.url,origin),{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
      const result=await worker.fetch(request,env);
      res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
    }catch(e){console.error('LAB_REQUEST_ERROR',e.message);res.writeHead(500);res.end('Local lab error');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  origin='https://localhost:'+server.address().port;
  return {origin,directory,async close(){await new Promise(r=>server.close(r));sql.close();}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const lab=await createLab();
  console.log('FORJA LAB LOCAL — dados sintéticos, SQLite local; sem Cloudflare remoto');
  console.log('Endereço: '+lab.origin+'\nUsuário: '+credentials.username+'\nSenha de teste: '+credentials.password+'\nDados locais: '+lab.directory);
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>lab.close().then(()=>process.exit(0)));
}
