import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { cpfSchemaPlan } from '../ops/cpf-schema-plan.mjs';

for (const startHasCpf of [false, true]) {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE users(id TEXT PRIMARY KEY, username TEXT NOT NULL' + (startHasCpf ? ', cpf TEXT' : '') + ')');
  db.prepare('INSERT INTO users(id,username) VALUES (?,?)').run('legacy','antigo');
  const columns = () => db.prepare('PRAGMA table_info(users)').all();
  const statements = cpfSchemaPlan(columns());
  assert.equal(statements.some(s => s.startsWith('ALTER TABLE')), !startHasCpf);
  for (const sql of statements) db.exec(sql);
  for (const sql of cpfSchemaPlan(columns())) db.exec(sql); // reexecução deve ser segura
  assert.equal(db.prepare("SELECT cpf FROM users WHERE id='legacy'").get().cpf, null);
  db.prepare('INSERT INTO users(id,username,cpf) VALUES (?,?,?)').run('new','atleta','52998224725');
  assert.throws(() => db.prepare('INSERT INTO users(id,username,cpf) VALUES (?,?,?)').run('dup','segundo','52998224725'), /UNIQUE|constraint/i);
  assert.equal(db.prepare('SELECT count(*) n FROM users').get().n, 2);
  console.log(startHasCpf ? 'CPF_EXISTING_SCHEMA_REAPPLY_PASS' : 'CPF_MISSING_SCHEMA_ADD_PASS');
  db.close();
}
assert.throws(()=>cpfSchemaPlan([{name:'unexpected'}]),/USERS_SCHEMA_UNEXPECTED/);
console.log('CPF_SCHEMA_UNEXPECTED_FAIL_CLOSED_PASS');
