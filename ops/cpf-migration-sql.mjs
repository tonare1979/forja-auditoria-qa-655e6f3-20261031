// Gera SQL de compatibilidade sem executar comandos nem acessar Cloudflare.
import { cpfSchemaPlan } from './cpf-schema-plan.mjs';
const args=process.argv.slice(2);
if(args.length!==1 || !['missing','existing'].includes(args[0])){
  console.error('USAGE: node ops/cpf-migration-sql.mjs missing|existing');
  process.exitCode=2;
}else{
  const cols=args[0]==='missing'?['id','username']:['id','username','cpf'];
  const sql=cpfSchemaPlan(cols);
  console.log('-- FORJA CPF migration review only; DO NOT AUTO APPLY');
  console.log('-- Mode: '+args[0]);
  for(const s of sql)console.log(s+';');
}
