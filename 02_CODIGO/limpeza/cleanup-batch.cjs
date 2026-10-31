'use strict';
/*
 * RC3 PILOTO: construtor PURO de lote transacional para Cloudflare D1.
 * Não expõe endpoint, não conecta à nuvem e nunca executa uma operação por conta própria.
 * É obrigatório conferir backup restaurável, inventário e identidade humana das linhas fictícias.
 * Injeção de parâmetros: DB.batch executa as instruções como transação atômica, inclusive falha de CHECK.
 */
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const empty = {sessions:[],weights:[],checks:{},drafts:{},journal:[],skipRunAfterB:false,extraExercises:{},exerciseChoices:{},deezerPlaylist:'',profile:{},planOverrides:{}};
const EXPECTED = Object.freeze({users:5,snapshots:3,snapshot_history:17,athlete_profiles:3,media:1,body_records:0,reviews:0,messages:0});
const sha = v => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const TABLES = ['users','snapshots','snapshot_history','athlete_profiles','media','body_records','reviews','messages'];
function validateManifest(m){
 if (!m || m.kind!=='RC3_SIGNED_LOCAL_REVIEW_ONLY' || m.candidate!=='bdac1a3d2657d9680459e37d91933cd0717e274b') throw Error('CANDIDATE_OR_REVIEW_ABSENT');
 if (!m.manualIdentityReviewConfirmed || m.remoteAuthorized === true) throw Error('REVIEW_ABSENT_OR_REMOTE_SCOPE_FORBIDDEN');
 if (!Number.isInteger(m.now) || m.now<=0 || !m.rows || typeof m.rows!=='object') throw Error('MANIFEST_INVALID');
 for(const k of TABLES){if(!Array.isArray(m.rows[k]) || m.rows[k].length!==EXPECTED[k])throw Error('SCOPE_DIVERGENCE_'+k)}
 const users=m.rows.users; if(users.filter(u=>u.role==='admin').length!==1 || users.filter(u=>u.role==='member').length!==4)throw Error('ROLE_DIVERGENCE');
 const ids = new Set(users.map(x=>x.id)); if(ids.size!==5)throw Error('DUPLICATE_USERS');
 for (const t of ['snapshots','snapshot_history','athlete_profiles','media']) for(const x of m.rows[t])if(!ids.has(x.user_id))throw Error('FOREIGN_ID_'+t);
 if(m.rows.media.some(x=>x.deleted_at!==null))throw Error('MEDIA_ALREADY_DELETED');
 for(const s of m.rows.snapshots){const d=JSON.parse(s.payload);if(!Array.isArray(d.sessions)||!Array.isArray(d.weights))throw Error('SNAPSHOT_INVALID');}
 return true;
}
function buildBatch(db,m){
 validateManifest(m);
 const steps=[];
 const put=(sql,...params)=>steps.push(db.prepare(sql).bind(...params));
 // D1 denies TEMP tables. The guard table is created and dropped within the atomic batch; failed batches roll back its creation.
 put('CREATE TABLE __forja_rc3_scope_guard_20261029 (ok INTEGER NOT NULL CHECK(ok=1))');
 const guard=(predicate,...values)=>put('INSERT INTO __forja_rc3_scope_guard_20261029(ok) SELECT CASE WHEN ('+predicate+') THEN 1 ELSE 0 END',...values);
 // Guardar contagens de TODAS as tabelas relevantes antes de qualquer alteração.
 for(const [table,total] of Object.entries(EXPECTED))guard('(SELECT count(*) FROM "'+table+'")=?',total);
 // IDs, status e credenciais de usuário não são escritos. Mas validar igualdade exata no instante do batch.
 for(const u of m.rows.users)guard('(SELECT count(*) FROM users WHERE id=? AND username=? AND role=? AND password_salt=? AND password_hash=? AND status=?)=1',u.id,u.username,u.role,u.password_salt,u.password_hash,u.status);
 // Os 3 payloads originais são parâmetros PRIVADOS, nunca logados/empacotados.
 for(const s of m.rows.snapshots){
  put('UPDATE snapshots SET revision=revision+1,payload=?,updated_at=? WHERE user_id=? AND revision=? AND payload=?',JSON.stringify(empty),m.now,s.user_id,s.revision,s.payload);
  guard('changes()=1');
 }
 for(const h of m.rows.snapshot_history){
  put('DELETE FROM snapshot_history WHERE user_id=? AND revision=? AND payload=?',h.user_id,h.revision,h.payload);
  guard('changes()=1');
 }
 for(const p of m.rows.athlete_profiles){
  put('UPDATE athlete_profiles SET payload=?,updated_at=? WHERE user_id=? AND payload=?','{}',m.now,p.user_id,p.payload);
  guard('changes()=1');
 }
 for(const media of m.rows.media){
  put('UPDATE media SET deleted_at=? WHERE id=? AND user_id=? AND deleted_at IS NULL AND object_key IS ? AND bytes=?',m.now,media.id,media.user_id,media.object_key,media.bytes);
  guard('changes()=1');
 }
 // Nenhum DELETE de body_records/reviews/messages. Os guardas garantem que já estão vazios.
 guard('(SELECT count(*) FROM snapshot_history)=0');
 guard('(SELECT count(*) FROM snapshots)=3');
 guard('(SELECT count(*) FROM athlete_profiles)=3');
 guard('(SELECT count(*) FROM media WHERE deleted_at IS NOT NULL)=1');
 guard('(SELECT count(*) FROM users)=5');
 put('DROP TABLE __forja_rc3_scope_guard_20261029');
 return steps;
}
module.exports={EXPECTED,empty,sha,validateManifest,buildBatch};
