// The account owner approves a specific request in D1. Approval never happens in the public API.
export async function bootstrap(req,env,h){
 const {body,verifier,reply,err,okName,isHex,randomHex,now,sha256,addSession,cookie}=h;
 const path=new URL(req.url).pathname;
 if(req.method!=='POST')return err(405,'METODO_INVALIDO','Use POST.');
 if(await env.DB.prepare('SELECT id FROM users LIMIT 1').first())return err(403,'CONFIGURACAO_ENCERRADA','A primeira conta já foi criada.');
 const p=await body(req),t=now();
 if(path==='/api/bootstrap/request'){
  const username=String(p.username||'').toLowerCase(),displayName=String(p.displayName||'').trim();
  if(!okName(username)||!displayName||displayName.length>70||!isHex(p.proof,64)||!isHex(p.salt,32)||!isHex(p.requestToken,64))return err(400,'DADOS_INVALIDOS','Confira nome, usuário e senha.');
  const ip=req.headers.get('CF-Connecting-IP');
  if(!ip)return err(400,'IDENTIFICACAO_AUSENTE','Não foi possível identificar a solicitação.');
  const ipHash=await sha256('bootstrap:'+ip);
  const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM bootstrap_requests WHERE ip_hash=? AND created_at>?').bind(ipHash,t-3600).first();
  if(recent.n>=5)return err(429,'LIMITE_DE_SOLICITACOES','Limite de solicitações. Tente novamente em uma hora.');
  const id=randomHex(16),hash=await verifier(env,p.proof),tokenHash=await sha256(p.requestToken);
  const inserted=await env.DB.prepare('INSERT INTO bootstrap_requests (id,username,display_name,password_salt,password_hash,claim_token_hash,ip_hash,status,created_at,expires_at) SELECT ?,?,?,?,?,?,?,\'pending\',?,? WHERE (SELECT COUNT(*) FROM bootstrap_requests WHERE ip_hash=? AND created_at>?)<5').bind(id,username,displayName,p.salt,hash,tokenHash,ipHash,t,t+3600,ipHash,t-3600).run();
  if(inserted.meta.changes!==1)return err(429,'LIMITE_DE_SOLICITACOES','Limite de solicitações. Tente novamente em uma hora.');
  return reply({ok:true,id,username,expiresAt:t+3600,status:'pending'},202);
 }
 if(!['/api/bootstrap/request-status','/api/bootstrap/claim'].includes(path))return err(404,'NAO_ENCONTRADO','Rota não encontrada.');
 if(!isHex(p.id,32)||!isHex(p.requestToken,64))return err(403,'SOLICITACAO_INVALIDA','Solicitação inválida.');
 const r=await env.DB.prepare('SELECT * FROM bootstrap_requests WHERE id=? AND claim_token_hash=?').bind(p.id,await sha256(p.requestToken)).first();
 if(!r)return err(403,'SOLICITACAO_INVALIDA','Solicitação inválida.');
 if(r.expires_at<=t)return err(410,'SOLICITACAO_EXPIRADA','Solicitação expirou. Faça um novo pedido.');
 if(path==='/api/bootstrap/request-status')return reply({id:r.id,status:r.status,username:r.username,salt:r.password_salt,expiresAt:r.expires_at});
 if(r.status!=='approved')return err(403,'APROVACAO_PENDENTE','O proprietário ainda precisa aprovar este pedido.');
 if(!isHex(p.proof,64)||(await verifier(env,p.proof))!==r.password_hash)return err(401,'SENHA_INVALIDA','A senha não corresponde ao pedido.');
 const userId=crypto.randomUUID();
 try{await env.DB.prepare('INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at) VALUES (?,?,?,\'admin\',?,?,?)').bind(userId,r.username,r.display_name,r.password_salt,r.password_hash,t).run();}
 catch(e){if(await env.DB.prepare('SELECT id FROM users LIMIT 1').first())return err(409,'CONFIGURACAO_ENCERRADA','A primeira conta já foi criada.');throw e;}
 await env.DB.prepare('UPDATE bootstrap_requests SET status=\'claimed\' WHERE id=?').bind(r.id).run();
 return reply({ok:true,user:{username:r.username,displayName:r.display_name,role:'admin'}},201,{'set-cookie':cookie(await addSession(env.DB,userId))});
}
