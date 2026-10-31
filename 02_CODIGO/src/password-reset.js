// Token de recuperação de uso único, duração de 15 min, envio por provedor configurado.
const emailFormat=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function passwordReset(req,env,h){
 const {body,reply,err,sha256,verifier,isHex,randomHex,now}=h;
 const path=new URL(req.url).pathname;
 if(req.method!=='POST')return err(405,'METODO_INVALIDO','Use POST.');
 const p=await body(req),t=now(),db=env.DB;
 const neutral=()=>reply({ok:true,message:'Se os dados estiverem cadastrados, enviaremos um código de recuperação.'});
 if(path==='/api/auth/reset/request'){
  if(!env.RESEND_API_KEY||!env.FORJA_RESET_FROM)return err(503,'RECUPERACAO_INDISPONIVEL','Recuperação por e-mail ainda não está configurada.');
  const username=String(p.username||'').trim().toLowerCase();
  if(!/^[a-z0-9_.-]{3,32}$/.test(username))return neutral();
  const ip=await sha256('reset-ip:'+String(req.headers.get('CF-Connecting-IP')||'unknown'));
  const counts=await db.prepare('SELECT COUNT(*) AS n FROM password_reset_requests WHERE ip_hash=? AND created_at>?').bind(ip,t-3600).first();
  if(counts.n>=5)return neutral();
  const user=await db.prepare('SELECT id,email FROM users WHERE username=? AND status=\'active\' AND role=\'member\'').bind(username).first();
  if(!user||!emailFormat.test(user.email||''))return neutral();
  const userCount=await db.prepare('SELECT COUNT(*) AS n FROM password_reset_requests WHERE user_id=? AND created_at>?').bind(user.id,t-3600).first();
  if(userCount.n>=3)return neutral();
  const token=randomHex(20),token_hash=await sha256(token),id=crypto.randomUUID();
  // Registrar primeiro para jamais enviar codigo que nao existe no D1.
  await db.prepare('INSERT INTO password_reset_requests (id,user_id,token_hash,ip_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)').bind(id,user.id,token_hash,ip,t,t+900).run();
  let delivered=false;
  try{
   const msg=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.FORJA_RESET_FROM,to:[user.email],subject:'FORJA — recuperação de acesso',text:'Seu código de recuperação: '+token+'\nVálido por 15 minutos. Se você não solicitou, ignore.'})});
   delivered=msg.ok;
   if(!delivered)console.error('FORJA reset mail delivery failed',msg.status);
  }catch(e){console.error('FORJA reset mail transport unavailable');}
  if(!delivered){await db.prepare('DELETE FROM password_reset_requests WHERE id=? AND used_at IS NULL').bind(id).run();return err(503,'ENVIO_INDISPONIVEL','Não foi possível enviar agora. Tente novamente mais tarde.');}
  return neutral();
 }
 if(path==='/api/auth/reset/confirm'){
  const username=String(p.username||'').trim().toLowerCase();
  if(!/^[a-z0-9_.-]{3,32}$/.test(username)||!isHex(p.token,40)||!isHex(p.salt,32)||!isHex(p.proof,64))return err(400,'DADOS_INVALIDOS','Confira código e nova senha.');
  const user=await db.prepare('SELECT id FROM users WHERE username=? AND status=\'active\' AND role=\'member\'').bind(username).first();
  if(!user)return err(401,'RECUPERACAO_INVALIDA','Código inválido ou expirado.');
  const tokenHash=await sha256(p.token);
  const row=await db.prepare('SELECT id FROM password_reset_requests WHERE user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>? AND attempts<5').bind(user.id,tokenHash,t).first();
  if(!row)return err(401,'RECUPERACAO_INVALIDA','Código inválido ou expirado.');
  const hash=await verifier(env,p.proof);
  // Uma unica transacao: nao consumir o codigo se a senha nao puder ser gravada.
  // A condicao SQL protege contra concorrencia entre confirmacoes do mesmo codigo.
  const steps=await db.batch([
   db.prepare('UPDATE users SET password_salt=?,password_hash=? WHERE id=? AND EXISTS (SELECT 1 FROM password_reset_requests WHERE id=? AND user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>?)').bind(p.salt,hash,user.id,row.id,user.id,tokenHash,t),
   db.prepare('UPDATE password_reset_requests SET used_at=? WHERE id=? AND user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>?').bind(t,row.id,user.id,tokenHash,t),
   db.prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id)
  ]);
  if(steps[0].meta.changes!==1||steps[1].meta.changes!==1)return err(409,'CODIGO_UTILIZADO','Código já utilizado ou expirado.');
  return reply({ok:true,message:'Senha atualizada. Entre novamente.'});
 }
 return err(404,'NAO_ENCONTRADO','Rota não encontrada.');
}
