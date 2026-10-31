var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/password-reset.js
var emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function passwordReset(req, env, h) {
  const { body: body2, reply: reply2, err: err2, sha256: sha2562, verifier: verifier2, isHex: isHex2, randomHex: randomHex2, now: now2 } = h;
  const path = new URL(req.url).pathname;
  if (req.method !== "POST") return err2(405, "METODO_INVALIDO", "Use POST.");
  const p = await body2(req), t = now2(), db = env.DB;
  const neutral = /* @__PURE__ */ __name(() => reply2({ ok: true, message: "Se os dados estiverem cadastrados, enviaremos um c\xF3digo de recupera\xE7\xE3o." }), "neutral");
  if (path === "/api/auth/reset/request") {
    if (!env.RESEND_API_KEY || !env.FORJA_RESET_FROM) return err2(503, "RECUPERACAO_INDISPONIVEL", "Recupera\xE7\xE3o por e-mail ainda n\xE3o est\xE1 configurada.");
    const username = String(p.username || "").trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,32}$/.test(username)) return neutral();
    const ip = await sha2562("reset-ip:" + String(req.headers.get("CF-Connecting-IP") || "unknown"));
    const counts = await db.prepare("SELECT COUNT(*) AS n FROM password_reset_requests WHERE ip_hash=? AND created_at>?").bind(ip, t - 3600).first();
    if (counts.n >= 5) return neutral();
    const user = await db.prepare("SELECT id,email FROM users WHERE username=? AND status='active' AND role='member'").bind(username).first();
    if (!user || !emailFormat.test(user.email || "")) return neutral();
    const userCount = await db.prepare("SELECT COUNT(*) AS n FROM password_reset_requests WHERE user_id=? AND created_at>?").bind(user.id, t - 3600).first();
    if (userCount.n >= 3) return neutral();
    const token = randomHex2(20), token_hash = await sha2562(token), id = crypto.randomUUID();
    await db.prepare("INSERT INTO password_reset_requests (id,user_id,token_hash,ip_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)").bind(id, user.id, token_hash, ip, t, t + 900).run();
    let delivered = false;
    try {
      const msg = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: env.FORJA_RESET_FROM, to: [user.email], subject: "FORJA \u2014 recupera\xE7\xE3o de acesso", text: "Seu c\xF3digo de recupera\xE7\xE3o: " + token + "\nV\xE1lido por 15 minutos. Se voc\xEA n\xE3o solicitou, ignore." }) });
      delivered = msg.ok;
      if (!delivered) console.error("FORJA reset mail delivery failed", msg.status);
    } catch (e) {
      console.error("FORJA reset mail transport unavailable");
    }
    if (!delivered) {
      await db.prepare("DELETE FROM password_reset_requests WHERE id=? AND used_at IS NULL").bind(id).run();
      return err2(503, "ENVIO_INDISPONIVEL", "N\xE3o foi poss\xEDvel enviar agora. Tente novamente mais tarde.");
    }
    return neutral();
  }
  if (path === "/api/auth/reset/confirm") {
    const username = String(p.username || "").trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,32}$/.test(username) || !isHex2(p.token, 40) || !isHex2(p.salt, 32) || !isHex2(p.proof, 64)) return err2(400, "DADOS_INVALIDOS", "Confira c\xF3digo e nova senha.");
    const user = await db.prepare("SELECT id FROM users WHERE username=? AND status='active' AND role='member'").bind(username).first();
    if (!user) return err2(401, "RECUPERACAO_INVALIDA", "C\xF3digo inv\xE1lido ou expirado.");
    const tokenHash = await sha2562(p.token);
    const row = await db.prepare("SELECT id FROM password_reset_requests WHERE user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>? AND attempts<5").bind(user.id, tokenHash, t).first();
    if (!row) return err2(401, "RECUPERACAO_INVALIDA", "C\xF3digo inv\xE1lido ou expirado.");
    const hash = await verifier2(env, p.proof);
    const steps = await db.batch([
      db.prepare("UPDATE users SET password_salt=?,password_hash=? WHERE id=? AND EXISTS (SELECT 1 FROM password_reset_requests WHERE id=? AND user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>?)").bind(p.salt, hash, user.id, row.id, user.id, tokenHash, t),
      db.prepare("UPDATE password_reset_requests SET used_at=? WHERE id=? AND user_id=? AND token_hash=? AND used_at IS NULL AND expires_at>?").bind(t, row.id, user.id, tokenHash, t),
      db.prepare("DELETE FROM sessions WHERE user_id=?").bind(user.id)
    ]);
    if (steps[0].meta.changes !== 1 || steps[1].meta.changes !== 1) return err2(409, "CODIGO_UTILIZADO", "C\xF3digo j\xE1 utilizado ou expirado.");
    return reply2({ ok: true, message: "Senha atualizada. Entre novamente." });
  }
  return err2(404, "NAO_ENCONTRADO", "Rota n\xE3o encontrada.");
}
__name(passwordReset, "passwordReset");

// src/admin-recovery.js
async function adminRecovery(req, env, h) {
  const { body: body2, verifier: verifier2, reply: reply2, err: err2, isHex: isHex2, randomHex: randomHex2, now: now2, sha256: sha2562 } = h;
  const path = new URL(req.url).pathname;
  if (req.method !== "POST") return err2(405, "METODO_INVALIDO", "Use POST.");
  const p = await body2(req), t = now2();
  if (path === "/api/admin-recovery/request") {
    if (!isHex2(p.salt, 32) || !isHex2(p.proof, 64) || !isHex2(p.requestToken, 64)) return err2(400, "DADOS_INVALIDOS", "Confira a nova senha.");
    const ip = req.headers.get("CF-Connecting-IP");
    if (!ip) return err2(400, "IDENTIFICACAO_AUSENTE", "N\xE3o foi poss\xEDvel identificar o pedido.");
    const ipHash = await sha2562("admin-recovery:" + ip);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_recovery_requests WHERE ip_hash=? AND created_at>?").bind(ipHash, t - 3600).first();
    if (recent.n >= 3) return err2(429, "LIMITE_DE_SOLICITACOES", "Aguarde antes de solicitar recupera\xE7\xE3o.");
    const admin = await env.DB.prepare("SELECT id FROM users WHERE role='admin' AND status='active'").first();
    if (!admin) return err2(409, "ADMIN_AUSENTE", "N\xE3o h\xE1 administrador ativo para recuperar.");
    const id = randomHex2(16);
    await env.DB.prepare("INSERT INTO admin_recovery_requests(id,admin_id,token_hash,password_salt,password_hash,ip_hash,status,created_at,expires_at) VALUES (?,?,?,?,?,?,'pending',?,?)").bind(id, admin.id, await sha2562(p.requestToken), p.salt, await verifier2(env, p.proof), ipHash, t, t + 900).run();
    return reply2({ ok: true, id, status: "pending", expiresAt: t + 900 }, 202);
  }
  if (!isHex2(p.id, 32) || !isHex2(p.requestToken, 64)) return err2(403, "PEDIDO_INVALIDO", "Pedido inv\xE1lido.");
  const r = await env.DB.prepare("SELECT * FROM admin_recovery_requests WHERE id=? AND token_hash=?").bind(p.id, await sha2562(p.requestToken)).first();
  if (!r) return err2(403, "PEDIDO_INVALIDO", "Pedido inv\xE1lido.");
  if (r.expires_at <= t) return err2(410, "PEDIDO_EXPIRADO", "Pedido expirado. Fa\xE7a outro pedido.");
  if (path === "/api/admin-recovery/status") return reply2({ id: r.id, status: r.status, expiresAt: r.expires_at });
  if (path !== "/api/admin-recovery/claim") return err2(404, "NAO_ENCONTRADO", "Rota n\xE3o encontrada.");
  if (r.status !== "approved") return err2(403, "APROVACAO_PENDENTE", "Aprova\xE7\xE3o pelo propriet\xE1rio ainda pendente.");
  if (!isHex2(p.proof, 64) || await verifier2(env, p.proof) !== r.password_hash) return err2(401, "SENHA_INVALIDA", "A nova senha n\xE3o confere.");
  const eligible = "EXISTS (SELECT 1 FROM admin_recovery_requests WHERE id=? AND admin_id=? AND status='approved' AND expires_at>?)";
  const result = await env.DB.batch([
    env.DB.prepare(`UPDATE users SET password_salt=?,password_hash=?,recovery_hash=NULL WHERE id=? AND role='admin' AND status='active' AND ${eligible}`).bind(r.password_salt, r.password_hash, r.admin_id, r.id, r.admin_id, t),
    env.DB.prepare(`DELETE FROM sessions WHERE user_id=? AND ${eligible}`).bind(r.admin_id, r.id, r.admin_id, t),
    env.DB.prepare("UPDATE admin_recovery_requests SET status='claimed' WHERE id=? AND admin_id=? AND status='approved' AND expires_at>?").bind(r.id, r.admin_id, t)
  ]);
  if (result[0].meta.changes !== 1 || result[2].meta.changes !== 1) return err2(409, "PEDIDO_UTILIZADO", "Pedido j\xE1 utilizado ou conta administrativa indispon\xEDvel.");
  return reply2({ ok: true, message: "Credencial administrativa atualizada. Entre com a nova senha." });
}
__name(adminRecovery, "adminRecovery");

// src/cpf.js
function normalizeCpf(value) {
  if (typeof value !== "string" || !/^[0-9.\-\s]+$/.test(value)) return null;
  const cpf = value.replace(/[.\-\s]/g, "");
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return null;
  for (let size = 9; size <= 10; size++) {
    const sum = [...cpf.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const check = sum * 10 % 11;
    if (Number(cpf[size]) !== (check === 10 ? 0 : check)) return null;
  }
  return cpf;
}
__name(normalizeCpf, "normalizeCpf");

// src/features.js
var dateOK = /* @__PURE__ */ __name((s) => typeof s === "string" && /^20\d\d-\d\d-\d\d$/.test(s) && !Number.isNaN(Date.parse(s)), "dateOK");
function validateBody(p) {
  if (!dateOK(p.date)) return false;
  let found = false;
  for (const [k, [min, max]] of Object.entries({ weight: [20, 300], fat: [0, 75], muscle: [0, 150], water: [0, 100], visceral: [0, 100], bmr: [300, 6e3] })) {
    if (p[k] !== void 0 && p[k] !== null && p[k] !== "") {
      if (!Number.isFinite(Number(p[k])) || Number(p[k]) < min || Number(p[k]) > max) return false;
      found = true;
    }
  }
  return found && String(p.note || "").length <= 1e3 && String(p.device || "").length <= 100;
}
__name(validateBody, "validateBody");
function feedback(data, bodyRecords = [], lastReview = null) {
  const sessions = data?.sessions || [], weights = data?.weights || [];
  const startDate = lastReview || sessions[0]?.date;
  const days = startDate ? Math.max(0, Math.floor((Date.now() - Date.parse(startDate)) / 864e5)) : 0;
  const lines = [`${sessions.length} treino(s) registrado(s).`];
  if (weights.length > 1) lines.push(`Varia\xE7\xE3o registrada de peso: ${(Number(weights.at(-1).weight) - Number(weights[0].weight)).toFixed(1)} kg.`);
  if (bodyRecords.length) lines.push(`${bodyRecords.length} avalia\xE7\xE3o(\xF5es) corporal(is). Compare medi\xE7\xF5es do mesmo aparelho e condi\xE7\xF5es.`);
  const stalled = sessions.length >= 4 && JSON.stringify(sessions.slice(-2).map((s) => s.exercises)) === JSON.stringify(sessions.slice(-4, -2).map((s) => s.exercises));
  let due = days >= 28 || stalled;
  lines.push(due ? "Revis\xE3o de ficha dispon\xEDvel. Confira frequ\xEAncia, execu\xE7\xE3o, esfor\xE7o e recupera\xE7\xE3o antes de decidir ajustes." : "Registre cargas, repeti\xE7\xF5es e esfor\xE7o para fundamentar sua pr\xF3xima revis\xE3o.");
  return { lines, due, days, reason: days >= 28 ? "28 dias" : stalled ? "Resultados repetidos" : "Acompanhamento em andamento", nextReview: startDate ? new Date(Date.parse(startDate) + 28 * 864e5).toISOString().slice(0, 10) : null };
}
__name(feedback, "feedback");
function localAnswer(text, f) {
  const q = text.toLocaleLowerCase("pt-BR");
  if (/dor|lesão|tontura|medica|remédio|sertralina/.test(q)) return "Registre o desconforto e interrompa o exerc\xEDcio que o provoca. O acompanhamento do FORJA n\xE3o faz diagn\xF3stico nem altera medica\xE7\xE3o. Procure orienta\xE7\xE3o profissional para sintomas ou mudan\xE7as de tratamento.";
  if (/senha|cadastro|aprova|conta/.test(q)) return "No Perfil voc\xEA solicita uma conta, troca a senha ou usa a chave pessoal de recupera\xE7\xE3o. O administrador aprova novos membros em Administra\xE7\xE3o. Cada conta tem registros separados.";
  if (/foto|bioimp|compart|instagram/.test(q)) return "Abra Evolu\xE7\xE3o para registrar fotos e bioimped\xE2ncia. No card de resultados, escolha os dados e imagens antes de compartilhar. Seus arquivos ficam privados; fotos n\xE3o permitem medir percentual de gordura.";
  if (/revis|ficha|28|4 semana/.test(q)) return f.lines.join(" ") + " Na revis\xE3o voc\xEA pode propor altera\xE7\xF5es e confirmar uma nova vers\xE3o da ficha, sem apagar treinos anteriores.";
  if (/nuvem|backup|sincron/.test(q)) return "O Perfil mostra o status da nuvem. Treinos e medidas sincronizam quando h\xE1 conex\xE3o; imagens exigem conta conectada. A c\xF3pia de seguran\xE7a \xE9 um arquivo independente para guardar e restaurar.";
  return f.lines.join(" ") + " Posso orientar os recursos do FORJA, resumir seus registros e preparar sua revis\xE3o. Para feedback de fotos e exames, anexe-os \xE0 conversa e deixe uma pergunta espec\xEDfica.";
}
__name(localAnswer, "localAnswer");
async function features(req, env, u, h) {
  const { body: body2, reply: reply2, err: err2, sha256: sha2562, verifier: verifier2, isHex: isHex2, okName: okName2, now: now2, randomHex: randomHex2, addSession: addSession2, cookie: cookie2 } = h, db = env.DB, url = new URL(req.url), path = url.pathname;
  if (path === "/api/accounts/register" && req.method === "POST") {
    const p = await body2(req), name = String(p.username || "").toLowerCase(), displayName = String(p.displayName || "").trim(), email = String(p.email || "").trim().toLowerCase();
    if (!okName2(name) || !displayName || displayName.length > 70 || !isHex2(p.salt, 32) || !isHex2(p.proof, 64) || !/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return err2(400, "CADASTRO_INVALIDO", "Confira nome, usu\xE1rio, e-mail e senha.");
    const cpf = normalizeCpf(p.cpf);
    if (!cpf) return err2(400, "CPF_INVALIDO", "CPF obrigat\xF3rio: confira os 11 n\xFAmeros.");
    const ipAddress = req.headers.get("CF-Connecting-IP");
    if (!ipAddress) return err2(400, "IDENTIFICACAO_AUSENTE", "N\xE3o foi poss\xEDvel identificar sua conex\xE3o para solicitar acesso.");
    const ip = await sha2562(ipAddress);
    const limited = await db.prepare("INSERT INTO registration_limits(ip_hash,created_at) SELECT ?,? WHERE (SELECT count(*) FROM registration_limits WHERE ip_hash=? AND created_at>?)<5").bind(ip, now2(), ip, now2() - 3600).run();
    if (!limited.meta.changes) return err2(429, "LIMITE_CADASTRO", "Aguarde antes de solicitar novas contas.");
    if (await db.prepare("SELECT id FROM users WHERE username=? OR email=? OR cpf=?").bind(name, email, cpf).first()) return err2(409, "CADASTRO_EXISTENTE", "Usu\xE1rio ou e-mail indispon\xEDvel.");
    const recoveryKey = randomHex2(24), hash = await verifier2(env, p.proof);
    const registration = await db.prepare("INSERT INTO users(id,username,display_name,role,password_salt,password_hash,created_at,status,email,recovery_hash,cpf) SELECT ?,?,?,'member',?,?,?,'pending',?,?,? WHERE (SELECT COUNT(*) FROM users WHERE role='member' AND status='pending') < 20").bind(crypto.randomUUID(), name, displayName, p.salt, hash, now2(), email, await sha2562(recoveryKey), cpf).run();
    if (!registration.meta.changes) return err2(409, "LIMITE_ATLETAS", "FORJA limitado a 11 atletas e 1 administrador. Nenhuma nova vaga dispon\xEDvel.");
    return reply2({ ok: true, status: "pending", recoveryKey, message: "Pedido recebido. Guarde sua chave de recupera\xE7\xE3o. Aguarde aprova\xE7\xE3o." }, 201);
  }
  if (path === "/api/accounts/recover" && req.method === "POST") {
    const p = await body2(req);
    if (!okName2(String(p.username || "").toLowerCase()) || !isHex2(p.recoveryKey, 48) || !isHex2(p.salt, 32) || !isHex2(p.proof, 64)) return err2(400, "RECUPERACAO_INVALIDA", "Confira usu\xE1rio, chave de recupera\xE7\xE3o e nova senha.");
    const old = await db.prepare("SELECT id,recovery_hash,status,role FROM users WHERE username=?").bind(String(p.username).toLowerCase()).first();
    if (!old || old.status !== "active" || old.role !== "member" || await sha2562(p.recoveryKey) !== old.recovery_hash) return err2(401, "RECUPERACAO_INVALIDA", "N\xE3o foi poss\xEDvel recuperar com esses dados.");
    const key = randomHex2(24);
    await db.batch([db.prepare("UPDATE users SET password_salt=?,password_hash=?,recovery_hash=? WHERE id=?").bind(p.salt, await verifier2(env, p.proof), await sha2562(key), old.id), db.prepare("DELETE FROM sessions WHERE user_id=?").bind(old.id)]);
    return reply2({ ok: true, recoveryKey: key, message: "Senha alterada. A chave anterior foi substitu\xEDda. Entre novamente." });
  }
  if (!u) return null;
  if (path === "/api/accounts/password" && req.method === "POST") {
    const p = await body2(req);
    if (!isHex2(p.currentProof, 64) || !isHex2(p.salt, 32) || !isHex2(p.proof, 64)) return err2(400, "DADOS_INVALIDOS", "Confira a senha atual e a nova senha.");
    const old = await db.prepare("SELECT password_hash FROM users WHERE id=?").bind(u.id).first();
    if (await verifier2(env, p.currentProof) !== old.password_hash) return err2(401, "SENHA_ATUAL_INVALIDA", "Senha atual inv\xE1lida.");
    const key = randomHex2(24);
    await db.batch([db.prepare("UPDATE users SET password_salt=?,password_hash=?,recovery_hash=? WHERE id=?").bind(p.salt, await verifier2(env, p.proof), await sha2562(key), u.id), db.prepare("DELETE FROM sessions WHERE user_id=?").bind(u.id)]);
    return reply2({ ok: true, recoveryKey: key, message: "Senha alterada. Guarde a nova chave e entre novamente." }, 200, { "set-cookie": "__Host-forja_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0" });
  }
  if (path === "/api/admin/users" && req.method === "GET") {
    if (u.role !== "admin") return err2(403, "ADMINISTRADOR", "Acesso restrito ao administrador.");
    return reply2({ users: (await db.prepare("SELECT id,username,display_name AS displayName,email,status,role,created_at FROM users ORDER BY created_at DESC").all()).results });
  }
  if (path === "/api/admin/users" && req.method === "DELETE") {
    if (u.role !== "admin") return err2(403, "ADMINISTRADOR", "Acesso restrito ao administrador.");
    const p = await body2(req);
    const removed = await db.prepare("DELETE FROM users WHERE id=? AND role='member' AND status='pending'").bind(String(p.id || "")).run();
    if (!removed.meta.changes) return err2(409, "PEDIDO_NAO_PENDENTE", "Somente solicita\xE7\xF5es pendentes podem ser rejeitadas.");
    return reply2({ ok: true, rejected: true });
  }
  if (path === "/api/admin/users" && req.method === "POST") {
    if (u.role !== "admin") return err2(403, "ADMINISTRADOR", "Acesso restrito ao administrador.");
    const p = await body2(req);
    if (!["active", "blocked"].includes(p.status)) return err2(400, "DADOS_INVALIDOS", "Estado inv\xE1lido.");
    const target = await db.prepare("SELECT role FROM users WHERE id=?").bind(p.id).first();
    if (!target || target.role === "admin") return err2(400, "ADMIN_PROTEGIDO", "A conta administradora n\xE3o pode ser bloqueada.");
    const changed = await db.prepare("UPDATE users SET status=? WHERE id=? AND role='member' AND (status!='pending' OR ?!='active' OR (SELECT COUNT(*) FROM users WHERE role='member' AND status IN ('active','blocked'))<11)").bind(p.status, p.id, p.status).run();
    if (!changed.meta.changes) return err2(409, "LIMITE_ATLETAS", "Limite de 11 atletas ativos ou bloqueados atingido.");
    if (p.status === "blocked") await db.prepare("DELETE FROM sessions WHERE user_id=?").bind(p.id).run();
    return reply2({ ok: true });
  }
  if (path === "/api/media" && req.method === "GET") {
    return reply2({ media: (await db.prepare("SELECT id,kind,view,date,note,mime,name,bytes,created_at FROM media WHERE user_id=? AND deleted_at IS NULL ORDER BY date DESC,created_at DESC").bind(u.id).all()).results, storage: env.PHOTOS ? "R2 privado" : "D1 privado \u2014 arquivos at\xE9 1 MB" });
  }
  if (path === "/api/media" && req.method === "POST") {
    const cl = Number(req.headers.get("content-length") || 0);
    if (cl > 14e5) return err2(413, "ARQUIVO_GRANDE", "Compacte o arquivo para at\xE9 1 MB.");
    const f = await req.formData(), file = f.get("file"), kind = String(f.get("kind") || "photo"), view = String(f.get("view") || "front"), date = String(f.get("date") || ""), note = String(f.get("note") || "");
    if (!file?.arrayBuffer || !dateOK(date) || !["photo", "exam"].includes(kind) || !["front", "side", "back", "exam"].includes(view) || file.size > 1e6 || note.length > 1e3) return err2(400, "ARQUIVO_INVALIDO", "Foto/exame at\xE9 1 MB, data e descri\xE7\xE3o v\xE1lidas s\xE3o necess\xE1rios.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let mime = bytes[0] === 255 && bytes[1] === 216 ? "image/jpeg" : bytes[0] === 137 && bytes[1] === 80 ? "image/png" : String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-" ? "application/pdf" : null;
    if (!mime || kind === "photo" && !mime.startsWith("image/")) return err2(400, "FORMATO_INVALIDO", "Use foto JPEG/PNG ou exame PDF.");
    const count = await db.prepare("SELECT count(*) AS n FROM media WHERE user_id=? AND deleted_at IS NULL").bind(u.id).first();
    if (count.n >= 300) return err2(413, "LIMITE_ARQUIVOS", "Limite de 300 arquivos por conta nesta configura\xE7\xE3o.");
    const id = crypto.randomUUID(), key = u.id + "/" + id;
    let inline = null;
    if (env.PHOTOS) await env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: mime } });
    else {
      let str = "";
      for (let i = 0; i < bytes.length; i += 8192) str += String.fromCharCode(...bytes.subarray(i, i + 8192));
      inline = btoa(str);
    }
    try {
      await db.prepare("INSERT INTO media(id,user_id,kind,view,date,note,mime,name,bytes,object_key,inline_data,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(id, u.id, kind, view, date, note, mime, String(file.name).slice(0, 100), bytes.length, env.PHOTOS ? key : null, inline, now2()).run();
    } catch (e) {
      if (env.PHOTOS) {
        try {
          await env.PHOTOS.delete(key);
        } catch (cleanup) {
          console.error("Falha ao limpar upload sem metadados", id, cleanup?.message);
        }
      }
      throw e;
    }
    return reply2({ ok: true, id }, 201);
  }
  if (path.startsWith("/api/media/") && ["GET", "DELETE"].includes(req.method)) {
    const id = path.slice("/api/media/".length), m = await db.prepare("SELECT * FROM media WHERE id=? AND user_id=? AND deleted_at IS NULL").bind(id, u.id).first();
    if (!m) return err2(404, "ARQUIVO_NAO_ENCONTRADO", "Arquivo indispon\xEDvel.");
    if (req.method === "DELETE") {
      const marker = now2();
      await db.prepare("UPDATE media SET deleted_at=? WHERE id=? AND user_id=? AND deleted_at IS NULL").bind(marker, id, u.id).run();
      if (m.object_key && env.PHOTOS) {
        try {
          await env.PHOTOS.delete(m.object_key);
        } catch (_) {
          try {
            await db.prepare("UPDATE media SET deleted_at=NULL WHERE id=? AND user_id=? AND deleted_at=?").bind(id, u.id, marker).run();
          } catch (e) {
            console.error("Falha ao restaurar status de m\xEDdia ap\xF3s erro do R2", id, e?.message);
          }
          return err2(503, "EXCLUSAO_PENDENTE", "Falha no armazenamento privado. Tente novamente.");
        }
      }
      return reply2({ ok: true });
    }
    let content;
    if (m.object_key) {
      const o = await env.PHOTOS?.get(m.object_key);
      if (!o) return err2(404, "ARQUIVO_NAO_ENCONTRADO", "Arquivo indispon\xEDvel.");
      content = o.body;
    } else content = Uint8Array.from(atob(m.inline_data), (c) => c.charCodeAt(0));
    return new Response(content, { headers: { "content-type": m.mime, "cache-control": "private, no-store", "x-content-type-options": "nosniff", "content-disposition": "inline", "content-security-policy": "default-src 'none'; sandbox" } });
  }
  if (path === "/api/body" && req.method === "GET") return reply2({ records: (await db.prepare("SELECT id,date,payload FROM body_records WHERE user_id=? AND deleted_at IS NULL ORDER BY date DESC,created_at DESC").bind(u.id).all()).results.map((r) => ({ ...JSON.parse(r.payload), id: r.id, date: r.date })) });
  if (path === "/api/body" && req.method === "POST") {
    const p = await body2(req);
    if (!validateBody(p)) return err2(400, "MEDIDAS_INVALIDAS", "Confira data e medidas.");
    const clean = { date: p.date, device: String(p.device || ""), note: String(p.note || "") };
    for (const k of ["weight", "fat", "muscle", "water", "visceral", "bmr"]) if (p[k] !== "" && p[k] != null) clean[k] = Number(p[k]);
    const id = crypto.randomUUID();
    await db.prepare("INSERT INTO body_records(id,user_id,date,payload,created_at) VALUES(?,?,?,?,?)").bind(id, u.id, p.date, JSON.stringify(clean), now2()).run();
    return reply2({ ok: true, id }, 201);
  }
  if (path.startsWith("/api/body/") && req.method === "DELETE") {
    await db.prepare("UPDATE body_records SET deleted_at=? WHERE id=? AND user_id=?").bind(now2(), path.slice(10), u.id).run();
    return reply2({ ok: true });
  }
  const snapshot = /* @__PURE__ */ __name(async () => {
    const row = await db.prepare("SELECT payload FROM snapshots WHERE user_id=?").bind(u.id).first();
    return row ? JSON.parse(row.payload) : { sessions: [], weights: [] };
  }, "snapshot");
  if (path === "/api/feedback" && req.method === "GET") {
    const last = await db.prepare("SELECT date FROM reviews WHERE user_id=? AND status='confirmed' ORDER BY created_at DESC LIMIT 1").bind(u.id).first();
    const data = await snapshot(), rs = (await db.prepare("SELECT payload FROM body_records WHERE user_id=? AND deleted_at IS NULL").bind(u.id).all()).results;
    return reply2({ ...feedback(data, rs, last?.date), sessions: data.sessions.slice(-12).map((s) => ({ date: s.date, name: s.name, code: s.code })), reviews: (await db.prepare("SELECT id,date,status,payload FROM reviews WHERE user_id=? ORDER BY created_at DESC LIMIT 20").bind(u.id).all()).results.map((r) => ({ ...r, data: JSON.parse(r.payload) })) });
  }
  if (path === "/api/reviews" && req.method === "POST") {
    const p = await body2(req);
    if (!dateOK(p.date) || String(p.note || "").length > 3e3 || !["review", "confirmed"].includes(p.status)) return err2(400, "REVISAO_INVALIDA", "Confira a revis\xE3o.");
    const changes = p.changes || [];
    if (!Array.isArray(changes) || changes.length > 30 || changes.some((c) => !["A", "B", "C", "D"].includes(c.code) || !Number.isInteger(c.index) || c.index < 0 || c.index > 59 || !Number.isInteger(c.sets) || c.sets < 1 || c.sets > 10 || typeof c.reps !== "string" || c.reps.length > 30 || !/^[0-9\s–\-xs×,./]+$/i.test(c.reps))) return err2(400, "REVISAO_INVALIDA", "Confira s\xE9ries e repeti\xE7\xF5es.");
    const id = String(p.reviewId || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return err2(400, "REVISAO_ID_INVALIDO", "Informe o ID est\xE1vel desta revis\xE3o.");
    const payload = JSON.stringify({ note: String(p.note || ""), changes });
    const existing = await db.prepare("SELECT user_id,date,status,payload FROM reviews WHERE id=?").bind(id).first();
    if (existing) {
      if (existing.user_id !== u.id) return err2(409, "REVISAO_ID_EXISTENTE", "Identificador indispon\xEDvel.");
      if (existing.date !== p.date || existing.status !== p.status || existing.payload !== payload) return err2(409, "REVISAO_DIVERGENTE", "ID reutilizado para uma revis\xE3o diferente.");
      return reply2({ ok: true, id, replayed: true }, 200);
    }
    const inserted = await db.prepare("INSERT OR IGNORE INTO reviews(id,user_id,date,status,payload,created_at) VALUES(?,?,?,?,?,?)").bind(id, u.id, p.date, p.status, payload, now2()).run();
    if (!inserted.meta.changes) {
      const prior = await db.prepare("SELECT user_id,date,status,payload FROM reviews WHERE id=?").bind(id).first();
      if (!prior || prior.user_id !== u.id || prior.date !== p.date || prior.status !== p.status || prior.payload !== payload) return err2(409, "REVISAO_DIVERGENTE", "Revis\xE3o divergente.");
      return reply2({ ok: true, id, replayed: true }, 200);
    }
    return reply2({ ok: true, id, replayed: false }, 201);
  }
  if (path === "/api/chat" && req.method === "GET") return reply2({ messages: (await db.prepare("SELECT role,content,attachments,created_at FROM messages WHERE user_id=? ORDER BY created_at DESC,rowid DESC LIMIT 60").bind(u.id).all()).results.reverse().map((m) => ({ ...m, attachments: JSON.parse(m.attachments) })), aiEnabled: false });
  if (path === "/api/chat" && req.method === "POST") {
    const p = await body2(req), text = String(p.text || "").trim(), ids = p.attachments || [];
    if (!text || text.length > 2e3 || !Array.isArray(ids) || ids.length > 6) return err2(400, "MENSAGEM_INVALIDA", "Escreva uma mensagem at\xE9 2.000 caracteres.");
    for (const id of ids) {
      if (!await db.prepare("SELECT id FROM media WHERE id=? AND user_id=? AND deleted_at IS NULL").bind(id, u.id).first()) return err2(403, "ANEXO_INVALIDO", "Anexo indispon\xEDvel para esta conta.");
    }
    const count = await db.prepare("SELECT count(*) AS n FROM messages WHERE user_id=? AND role='user' AND created_at>?").bind(u.id, now2() - 86400).first();
    if (count.n >= 50) return err2(429, "LIMITE_CHAT", "Limite de 50 mensagens di\xE1rias.");
    const last = await db.prepare("SELECT date FROM reviews WHERE user_id=? AND status='confirmed' ORDER BY created_at DESC LIMIT 1").bind(u.id).first();
    const data = await snapshot(), f = feedback(data, [], last?.date);
    let answer = localAnswer(text, f), mode = "orienta\xE7\xF5es do FORJA";
    if (ids.length) answer += " Os anexos ficaram vinculados \xE0 conversa. Esta resposta n\xE3o interpreta automaticamente imagens ou exames.";
    await db.batch([db.prepare("INSERT INTO messages(id,user_id,role,content,attachments,created_at) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(), u.id, "user", text, JSON.stringify(ids), now2()), db.prepare("INSERT INTO messages(id,user_id,role,content,attachments,created_at) VALUES(?,?,?,?,?,?)").bind(crypto.randomUUID(), u.id, "assistant", answer, "[]", now2())]);
    return reply2({ ok: true, answer, mode });
  }
  return null;
}
__name(features, "features");

// src/bootstrap.js
async function bootstrap(req, env, h) {
  const { body: body2, verifier: verifier2, reply: reply2, err: err2, okName: okName2, isHex: isHex2, randomHex: randomHex2, now: now2, sha256: sha2562, addSession: addSession2, cookie: cookie2 } = h;
  const path = new URL(req.url).pathname;
  if (req.method !== "POST") return err2(405, "METODO_INVALIDO", "Use POST.");
  if (await env.DB.prepare("SELECT id FROM users LIMIT 1").first()) return err2(403, "CONFIGURACAO_ENCERRADA", "A primeira conta j\xE1 foi criada.");
  const p = await body2(req), t = now2();
  if (path === "/api/bootstrap/request") {
    const username = String(p.username || "").toLowerCase(), displayName = String(p.displayName || "").trim();
    if (!okName2(username) || !displayName || displayName.length > 70 || !isHex2(p.proof, 64) || !isHex2(p.salt, 32) || !isHex2(p.requestToken, 64)) return err2(400, "DADOS_INVALIDOS", "Confira nome, usu\xE1rio e senha.");
    const ip = req.headers.get("CF-Connecting-IP");
    if (!ip) return err2(400, "IDENTIFICACAO_AUSENTE", "N\xE3o foi poss\xEDvel identificar a solicita\xE7\xE3o.");
    const ipHash = await sha2562("bootstrap:" + ip);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM bootstrap_requests WHERE ip_hash=? AND created_at>?").bind(ipHash, t - 3600).first();
    if (recent.n >= 5) return err2(429, "LIMITE_DE_SOLICITACOES", "Limite de solicita\xE7\xF5es. Tente novamente em uma hora.");
    const id = randomHex2(16), hash = await verifier2(env, p.proof), tokenHash = await sha2562(p.requestToken);
    const inserted = await env.DB.prepare("INSERT INTO bootstrap_requests (id,username,display_name,password_salt,password_hash,claim_token_hash,ip_hash,status,created_at,expires_at) SELECT ?,?,?,?,?,?,?,'pending',?,? WHERE (SELECT COUNT(*) FROM bootstrap_requests WHERE ip_hash=? AND created_at>?)<5").bind(id, username, displayName, p.salt, hash, tokenHash, ipHash, t, t + 3600, ipHash, t - 3600).run();
    if (inserted.meta.changes !== 1) return err2(429, "LIMITE_DE_SOLICITACOES", "Limite de solicita\xE7\xF5es. Tente novamente em uma hora.");
    return reply2({ ok: true, id, username, expiresAt: t + 3600, status: "pending" }, 202);
  }
  if (!["/api/bootstrap/request-status", "/api/bootstrap/claim"].includes(path)) return err2(404, "NAO_ENCONTRADO", "Rota n\xE3o encontrada.");
  if (!isHex2(p.id, 32) || !isHex2(p.requestToken, 64)) return err2(403, "SOLICITACAO_INVALIDA", "Solicita\xE7\xE3o inv\xE1lida.");
  const r = await env.DB.prepare("SELECT * FROM bootstrap_requests WHERE id=? AND claim_token_hash=?").bind(p.id, await sha2562(p.requestToken)).first();
  if (!r) return err2(403, "SOLICITACAO_INVALIDA", "Solicita\xE7\xE3o inv\xE1lida.");
  if (r.expires_at <= t) return err2(410, "SOLICITACAO_EXPIRADA", "Solicita\xE7\xE3o expirou. Fa\xE7a um novo pedido.");
  if (path === "/api/bootstrap/request-status") return reply2({ id: r.id, status: r.status, username: r.username, salt: r.password_salt, expiresAt: r.expires_at });
  if (r.status !== "approved") return err2(403, "APROVACAO_PENDENTE", "O propriet\xE1rio ainda precisa aprovar este pedido.");
  if (!isHex2(p.proof, 64) || await verifier2(env, p.proof) !== r.password_hash) return err2(401, "SENHA_INVALIDA", "A senha n\xE3o corresponde ao pedido.");
  const userId = crypto.randomUUID();
  try {
    await env.DB.prepare("INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at) VALUES (?,?,?,'admin',?,?,?)").bind(userId, r.username, r.display_name, r.password_salt, r.password_hash, t).run();
  } catch (e) {
    if (await env.DB.prepare("SELECT id FROM users LIMIT 1").first()) return err2(409, "CONFIGURACAO_ENCERRADA", "A primeira conta j\xE1 foi criada.");
    throw e;
  }
  await env.DB.prepare("UPDATE bootstrap_requests SET status='claimed' WHERE id=?").bind(r.id).run();
  return reply2({ ok: true, user: { username: r.username, displayName: r.display_name, role: "admin" } }, 201, { "set-cookie": cookie2(await addSession2(env.DB, userId)) });
}
__name(bootstrap, "bootstrap");

// src/index.js
var enc = new TextEncoder();
var jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-frame-options": "DENY" };
var TTL = 30 * 24 * 3600;
var MAX_BODY = 65e4;
var now = /* @__PURE__ */ __name(() => Math.floor(Date.now() / 1e3), "now");
var reply = /* @__PURE__ */ __name((o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { ...jsonHeaders, ...headers } }), "reply");
var hex = /* @__PURE__ */ __name((buf) => [...new Uint8Array(buf)].map((v) => v.toString(16).padStart(2, "0")).join(""), "hex");
var randomHex = /* @__PURE__ */ __name((n) => hex(crypto.getRandomValues(new Uint8Array(n))), "randomHex");
var sha256 = /* @__PURE__ */ __name(async (value) => hex(await crypto.subtle.digest("SHA-256", enc.encode(value))), "sha256");
var isHex = /* @__PURE__ */ __name((s, n) => typeof s === "string" && new RegExp(`^[a-f0-9]{${n}}$`).test(s), "isHex");
async function verifier(env, proof) {
  if (!env.FORJA_AUTH_PEPPER || env.FORJA_AUTH_PEPPER.length < 32) throw Error("Segredo de autentica\xE7\xE3o n\xE3o configurado");
  const key = await crypto.subtle.importKey("raw", enc.encode(env.FORJA_AUTH_PEPPER), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(proof)));
}
__name(verifier, "verifier");
var okName = /* @__PURE__ */ __name((s) => typeof s === "string" && /^[a-z0-9_.-]{3,32}$/.test(s), "okName");
var okLoginIdentity = /* @__PURE__ */ __name((s) => okName(s) || typeof s === "string" && s.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "okLoginIdentity");
function err(status, code, message) {
  return reply({ error: code, message }, status);
}
__name(err, "err");
async function body(req) {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("JSON obrigat\xF3rio");
  const cl = Number(req.headers.get("content-length") || 0);
  if (cl > MAX_BODY) throw new Error("Corpo muito grande");
  const text = await req.text();
  if (text.length > MAX_BODY) throw new Error("Corpo muito grande");
  return JSON.parse(text);
}
__name(body, "body");
function sameOrigin(req) {
  const o = req.headers.get("origin");
  return !!o && o === new URL(req.url).origin;
}
__name(sameOrigin, "sameOrigin");
function cookie(token) {
  return `__Host-forja_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TTL}`;
}
__name(cookie, "cookie");
function clearCookie() {
  return "__Host-forja_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0";
}
__name(clearCookie, "clearCookie");
function cleanUser(u) {
  return { username: u.username, displayName: u.display_name, role: u.role };
}
__name(cleanUser, "cleanUser");
async function who(req, db) {
  const val = req.headers.get("cookie")?.match(/(?:^|;\s*)__Host-forja_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!val) return null;
  const h = await sha256(val);
  return db.prepare("SELECT users.id,users.username,users.display_name,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>? AND users.status='active'").bind(h, now()).first();
}
__name(who, "who");
async function addSession(db, userId) {
  const token = randomHex(32), h = await sha256(token), t = now();
  await db.prepare("INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)").bind(h, userId, t + TTL, t).run();
  return token;
}
__name(addSession, "addSession");
async function ipKey(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  return sha256("forja-login-ip-v1:" + ip);
}
__name(ipKey, "ipKey");
async function rate(db, key) {
  const row = await db.prepare("SELECT blocked_until FROM login_ip_throttle WHERE ip_hash=?").bind(key).first();
  return !!row && row.blocked_until > now();
}
__name(rate, "rate");
async function fail(db, key) {
  const t = now();
  await db.prepare(`INSERT INTO login_ip_throttle(ip_hash,failed_count,window_start,blocked_until)
 VALUES (?,1,?,0) ON CONFLICT(ip_hash) DO UPDATE SET
 failed_count=CASE WHEN ?-window_start>=900 THEN 1 ELSE failed_count+1 END,
 window_start=CASE WHEN ?-window_start>=900 THEN ? ELSE window_start END,
 blocked_until=CASE WHEN ?-window_start>=900 THEN 0
 WHEN failed_count+1>=12 THEN ?+MIN(900,15*(1 << MIN(6,failed_count-11))) ELSE blocked_until END`).bind(key, t, t, t, t, t, t).run();
}
__name(fail, "fail");
async function login(req, db, env) {
  const { username, proof } = await body(req), name = String(username || "").trim().toLowerCase();
  if (!okLoginIdentity(name) || !isHex(proof, 64)) return err(401, "LOGIN_INVALIDO", "Credenciais inv\xE1lidas.");
  const key = await ipKey(req);
  if (await rate(db, key)) return err(429, "TEMPORARIAMENTE_BLOQUEADO", "Muitas tentativas desta conex\xE3o. Tente mais tarde.");
  const u = await db.prepare("SELECT * FROM users WHERE username=? OR email=?").bind(name, name).first();
  const h = await verifier(env, proof);
  const matched = !!(u && u.status === "active" && h === u.password_hash);
  if (!matched) {
    await fail(db, key);
    return err(401, "LOGIN_INVALIDO", "Credenciais inv\xE1lidas.");
  }
  await db.prepare("DELETE FROM login_ip_throttle WHERE ip_hash=?").bind(key).run();
  const token = await addSession(db, u.id);
  return reply({ ok: true, user: cleanUser(u) }, 200, { "set-cookie": cookie(token) });
}
__name(login, "login");
async function setup(req, env) {
  const db = env.DB, p = await body(req);
  if (!env.FORJA_SETUP_KEY || typeof env.FORJA_SETUP_KEY !== "string" || env.FORJA_SETUP_KEY.length < 20) return err(503, "CONFIGURACAO_PENDENTE", "Chave de instala\xE7\xE3o n\xE3o configurada no Worker.");
  const any = await db.prepare("SELECT id FROM users LIMIT 1").first();
  if (any) return err(403, "CONFIGURACAO_ENCERRADA", "A primeira conta j\xE1 foi criada.");
  if (p.setupKey !== env.FORJA_SETUP_KEY) return err(403, "CHAVE_INVALIDA", "Chave de instala\xE7\xE3o incorreta.");
  const username = String(p.username || "").toLowerCase(), displayName = String(p.displayName || "").trim();
  if (!okName(username) || !isHex(p.proof, 64) || !isHex(p.salt, 32) || !displayName || displayName.length > 70) return err(400, "DADOS_INVALIDOS", "Usu\xE1rio (3\u201332 caracteres), nome e senha com pelo menos 6 caracteres obrigat\xF3rios.");
  const salt = p.salt, hash = await verifier(env, p.proof), id = crypto.randomUUID(), t = now();
  await db.prepare("INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?)").bind(id, username, displayName, "admin", salt, hash, t).run();
  const token = await addSession(db, id);
  return reply({ ok: true, user: { username, displayName, role: "admin" } }, 201, { "set-cookie": cookie(token) });
}
__name(setup, "setup");
async function newUser(req, db, env) {
  const p = await body(req), username = String(p.username || "").toLowerCase(), displayName = String(p.displayName || "").trim();
  if (!okName(username) || !isHex(p.proof, 64) || !isHex(p.salt, 32) || !displayName || displayName.length > 70) return err(400, "DADOS_INVALIDOS", "Nome de usu\xE1rio, nome de exibi\xE7\xE3o e senha de 6 ou mais caracteres necess\xE1rios.");
  if (await db.prepare("SELECT id FROM users WHERE username=?").bind(username).first()) return err(409, "USUARIO_EXISTENTE", "Nome de usu\xE1rio indispon\xEDvel.");
  const email = String(p.email || "").trim().toLowerCase(), cpf = normalizeCpf(p.cpf);
  if (!cpf) return err(400, "CPF_INVALIDO", "CPF obrigat\xF3rio: confira os 11 n\xFAmeros.");
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return err(400, "EMAIL_INVALIDO", "Informe o e-mail do atleta para recupera\xE7\xE3o de acesso.");
  if (await db.prepare("SELECT id FROM users WHERE email=?").bind(email).first()) return err(409, "EMAIL_EXISTENTE", "E-mail j\xE1 cadastrado.");
  if (await db.prepare("SELECT id FROM users WHERE cpf=?").bind(cpf).first()) return err(409, "CPF_EXISTENTE", "CPF j\xE1 cadastrado.");
  const salt = p.salt, hash = await verifier(env, p.proof), recoveryKey = randomHex(24);
  const inserted = await db.prepare("INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at,status,email,recovery_hash,cpf) SELECT ?,?,?,'member',?,?,?,'active',?,?,? WHERE (SELECT COUNT(*) FROM users WHERE role='member' AND status IN ('active','blocked'))<11").bind(crypto.randomUUID(), username, displayName, salt, hash, now(), email, await sha256(recoveryKey), cpf).run();
  if (inserted.meta.changes !== 1) return err(409, "LIMITE_ATLETAS", "Limite de 11 atletas atingido.");
  return reply({ ok: true, username, recoveryKey }, 201);
}
__name(newUser, "newUser");
var validState = /* @__PURE__ */ __name((s) => !!(s && typeof s === "object" && !Array.isArray(s) && Array.isArray(s.sessions) && Array.isArray(s.weights) && s.sessions.length < 1e4 && s.weights.length < 1e4 && s.sessions.every((x) => x && typeof x.id === "string" && ["A", "B", "CR", "C", "D", "SAT", "SUN"].includes(x.code) && typeof x.date === "string" && Array.isArray(x.exercises) && x.exercises.length <= 60 && x.exercises.every((e) => e && typeof e.name === "string" && Array.isArray(e.sets) && e.sets.every((v) => v && Number.isFinite(Number(v.kg)) && Number(v.kg) >= 0 && Number.isFinite(Number(v.reps)) && Number(v.reps) > 0))) && s.weights.every((w) => w && typeof w.date === "string" && Number.isFinite(Number(w.weight)) && Number(w.weight) >= 20 && Number(w.weight) <= 300) && (s.journal === void 0 || Array.isArray(s.journal)) && (s.checks === void 0 || s.checks && typeof s.checks === "object" && !Array.isArray(s.checks)) && (s.drafts === void 0 || s.drafts && typeof s.drafts === "object" && !Array.isArray(s.drafts)) && (s.extraExercises === void 0 || s.extraExercises && typeof s.extraExercises === "object" && !Array.isArray(s.extraExercises)) && (s.deezerPlaylist === void 0 || typeof s.deezerPlaylist === "string" && s.deezerPlaylist.length <= 600) && (s.exerciseChoices === void 0 || s.exerciseChoices && typeof s.exerciseChoices === "object" && !Array.isArray(s.exerciseChoices))), "validState");
async function getState(db, u) {
  const r = await db.prepare("SELECT revision,payload,updated_at FROM snapshots WHERE user_id=?").bind(u.id).first();
  return reply({ revision: r?.revision || 0, updatedAt: r?.updated_at || null, data: r ? JSON.parse(r.payload) : null });
}
__name(getState, "getState");
async function putState(req, db, u) {
  const p = await body(req);
  if (!Number.isSafeInteger(p.baseRevision) || p.baseRevision < 0 || !validState(p.data)) return err(400, "DADOS_INVALIDOS", "Revis\xE3o ou dados inv\xE1lidos.");
  const payload = JSON.stringify(p.data);
  if (payload.length > MAX_BODY) return err(413, "LIMITE_DE_DADOS", "Limite de dados excedido.");
  const t = now();
  if (p.baseRevision === 0) {
    const r = await db.prepare("INSERT OR IGNORE INTO snapshots (user_id,revision,payload,updated_at) VALUES (?,1,?,?)").bind(u.id, payload, t).run();
    if (r.meta.changes === 1) return reply({ ok: true, revision: 1, updatedAt: t });
  } else {
    const prev = await db.prepare("SELECT revision FROM snapshots WHERE user_id=?").bind(u.id).first();
    if (prev?.revision === p.baseRevision) {
      const results = await db.batch([
        db.prepare("INSERT INTO snapshot_history (user_id,revision,payload,created_at) SELECT user_id,revision,payload,? FROM snapshots WHERE user_id=? AND revision=?").bind(t, u.id, p.baseRevision),
        db.prepare("UPDATE snapshots SET revision=revision+1,payload=?,updated_at=? WHERE user_id=? AND revision=?").bind(payload, t, u.id, p.baseRevision),
        db.prepare("DELETE FROM snapshot_history WHERE user_id=? AND revision NOT IN (SELECT revision FROM snapshot_history WHERE user_id=? ORDER BY revision DESC LIMIT 15)").bind(u.id, u.id)
      ]);
      if (results[0]?.meta?.changes === 1 && results[1]?.meta?.changes === 1) return reply({ ok: true, revision: p.baseRevision + 1, updatedAt: t });
    }
  }
  const latest = await db.prepare("SELECT revision,payload,updated_at FROM snapshots WHERE user_id=?").bind(u.id).first();
  if (latest && latest.payload === payload) return reply({ ok: true, revision: latest.revision, updatedAt: latest.updated_at, replayed: true });
  return reply({ error: "REVISAO_DIVERGENTE", message: "A nuvem foi alterada por outro dispositivo. Seus registros locais n\xE3o foram descartados.", revision: latest?.revision || 0 }, 409);
}
__name(putState, "putState");
var index_default = { async fetch(req, env) {
  const url = new URL(req.url), path = url.pathname;
  try {
    if (!path.startsWith("/api/")) return env.ASSETS.fetch(req);
    if (!env.DB) return err(503, "DB_AUSENTE", "Banco D1 n\xE3o configurado.");
    if (req.method !== "GET" && !sameOrigin(req)) return err(403, "ORIGEM_INVALIDA", "Requisi\xE7\xE3o de outra origem bloqueada.");
    if (path === "/api/health" && req.method === "GET") return reply({ ok: true, app: "FORJA", api: 1 });
    if (path === "/api/bootstrap/status" && req.method === "GET") {
      const one = await env.DB.prepare("SELECT id FROM users LIMIT 1").first();
      return reply({ needsSetup: !one, approvalSupported: true });
    }
    if (path.startsWith("/api/bootstrap/")) return await bootstrap(req, env, { body, verifier, reply, err, okName, isHex, randomHex, now, sha256, addSession, cookie });
    if (path.startsWith("/api/auth/reset/")) return await passwordReset(req, env, { body, reply, err, sha256, verifier, isHex, randomHex, now });
    if (path.startsWith("/api/admin-recovery/")) return await adminRecovery(req, env, { body, verifier, reply, err, isHex, randomHex, now, sha256 });
    if (path === "/api/auth/salt" && req.method === "GET") {
      const name = String(url.searchParams.get("username") || "").toLowerCase();
      if (!okLoginIdentity(name)) return err(400, "DADOS_INVALIDOS", "Usu\xE1rio ou e-mail inv\xE1lido.");
      const row = await env.DB.prepare("SELECT password_salt FROM users WHERE username=? OR email=?").bind(name, name).first();
      const dummy = (await verifier(env, "fake-salt:" + name)).slice(0, 32);
      return reply({ salt: row?.password_salt || dummy });
    }
    if (path === "/api/auth/setup" && req.method === "POST") return await setup(req, env);
    if (path === "/api/auth/login" && req.method === "POST") return await login(req, env.DB, env);
    const helpers = { body, reply, err, sha256, verifier, isHex, okName, now, randomHex, addSession, cookie };
    if (path.startsWith("/api/accounts/recover") || path === "/api/accounts/register" && req.method === "POST") {
      const publicResult = await features(req, env, null, helpers);
      if (publicResult) return publicResult;
    }
    const u = await who(req, env.DB);
    if (!u) return err(401, "NAO_AUTENTICADO", "Entre na sua conta para usar a nuvem.");
    const featureResult = await features(req, env, u, helpers);
    if (featureResult) return featureResult;
    if (path === "/api/auth/me" && req.method === "GET") return reply({ user: cleanUser(u) });
    if (path === "/api/auth/logout" && req.method === "POST") {
      const val = req.headers.get("cookie")?.match(/__Host-forja_session=([a-f0-9]{64})/)?.[1];
      if (val) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(val)).run();
      return reply({ ok: true }, 200, { "set-cookie": clearCookie() });
    }
    if (path === "/api/users" && req.method === "POST" && u.role === "admin") return await newUser(req, env.DB, env);
    if (path === "/api/state" && req.method === "GET") return await getState(env.DB, u);
    if (path === "/api/state" && req.method === "PUT") return await putState(req, env.DB, u);
    return err(404, "NAO_ENCONTRADO", "Rota n\xE3o encontrada.");
  } catch (e) {
    if (e instanceof SyntaxError || e?.message === "JSON obrigat\xF3rio" || e?.message === "Corpo muito grande") return err(400, "REQUISICAO_INVALIDA", "JSON inv\xE1lido ou muito grande.");
    console.error("FORJA API", path, String(e));
    return err(500, "FALHA_INTERNA", "N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o. Os dados locais permanecem no aparelho.");
  }
} };
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
