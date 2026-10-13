// Recuperacao administrativa somente mediante aprovação explícita no D1 pelo proprietário.
// Não utiliza FORJA_SETUP_KEY nem modifica FORJA_AUTH_PEPPER.
export async function adminRecovery(req,env,h){
 const {body,verifier,reply,err,isHex,randomHex,now,sha256}=h;
 const path=new URL(req.url).pathname;
 if(req.method!=='POST')return err(405,'METODO_INVALIDO','Use POST.');
 const p=await body(req),t=now();
 if(path==='/api/admin-recovery/request'){
  if(!isHex(p.salt,32)||!isHex(p.proof,64)||!isHex(p.requestToken,64))return err(400,'DADOS_INVALIDOS','Confira a nova senha.');
  const ip=req.headers.get('CF-Connecting-IP');
  if(!ip)return err(400,'IDENTIFICACAO_AUSENTE','Não foi possível identificar o pedido.');
  const ipHash=await sha256('admin-recovery:'+ip);
  const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM admin_recovery_requests WHERE ip_hash=? AND created_at>?').bind(ipHash,t-3600).first();
  if(recent.n>=3)return err(429,'LIMITE_DE_SOLICITACOES','Aguarde antes de solicitar recuperação.');
  const admin=await env.DB.prepare("SELECT id FROM users WHERE role='admin' AND status='active'").first();
  if(!admin)return err(409,'ADMIN_AUSENTE','Não há administrador ativo para recuperar.');
  const id=randomHex(16);
  await env.DB.prepare("INSERT INTO admin_recovery_requests(id,admin_id,token_hash,password_salt,password_hash,ip_hash,status,created_at,expires_at) VALUES (?,?,?,?,?,?,'pending',?,?)").bind(id,admin.id,await sha256(p.requestToken),p.salt,await verifier(env,p.proof),ipHash,t,t+900).run();
  return reply({ok:true,id,status:'pending',expiresAt:t+900},202);
 }
 if(!isHex(p.id,32)||!isHex(p.requestToken,64))return err(403,'PEDIDO_INVALIDO','Pedido inválido.');
 const r=await env.DB.prepare('SELECT * FROM admin_recovery_requests WHERE id=? AND token_hash=?').bind(p.id,await sha256(p.requestToken)).first();
 if(!r)return err(403,'PEDIDO_INVALIDO','Pedido inválido.');
 if(r.expires_at<=t)return err(410,'PEDIDO_EXPIRADO','Pedido expirado. Faça outro pedido.');
 if(path==='/api/admin-recovery/status')return reply({id:r.id,status:r.status,expiresAt:r.expires_at});
 if(path!=='/api/admin-recovery/claim')return err(404,'NAO_ENCONTRADO','Rota não encontrada.');
 if(r.status!=='approved')return err(403,'APROVACAO_PENDENTE','Aprovação pelo proprietário ainda pendente.');
 if(!isHex(p.proof,64)||await verifier(env,p.proof)!==r.password_hash)return err(401,'SENHA_INVALIDA','A nova senha não confere.');
 // D1 batch executa atomicamente: nenhuma senha ou sessão muda se a reivindicação falhar.
 // As três operações exigem o mesmo pedido aprovado e não expirado.
 const eligible="EXISTS (SELECT 1 FROM admin_recovery_requests WHERE id=? AND admin_id=? AND status='approved' AND expires_at>?)";
 const result=await env.DB.batch([
  env.DB.prepare(`UPDATE users SET password_salt=?,password_hash=?,recovery_hash=NULL WHERE id=? AND role='admin' AND status='active' AND ${eligible}`).bind(r.password_salt,r.password_hash,r.admin_id,r.id,r.admin_id,t),
  env.DB.prepare(`DELETE FROM sessions WHERE user_id=? AND ${eligible}`).bind(r.admin_id,r.id,r.admin_id,t),
  env.DB.prepare("UPDATE admin_recovery_requests SET status='claimed' WHERE id=? AND admin_id=? AND status='approved' AND expires_at>?").bind(r.id,r.admin_id,t)
 ]);
 if(result[0].meta.changes!==1||result[2].meta.changes!==1)return err(409,'PEDIDO_UTILIZADO','Pedido já utilizado ou conta administrativa indisponível.');
 return reply({ok:true,message:'Credencial administrativa atualizada. Entre com a nova senha.'});
}
