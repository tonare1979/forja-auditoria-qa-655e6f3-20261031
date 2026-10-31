// Pure validation shared by both athlete enrollment endpoints.
export function normalizeCpf(value){
 if(typeof value!=='string'||!/^[0-9.\-\s]+$/.test(value))return null;
 const cpf=value.replace(/[.\-\s]/g,'');
 if(!/^\d{11}$/.test(cpf)||/^(\d)\1{10}$/.test(cpf))return null;
 for(let size=9;size<=10;size++){
  const sum=[...cpf.slice(0,size)].reduce((total,digit,index)=>total+Number(digit)*(size+1-index),0);
  const check=(sum*10)%11;
  if(Number(cpf[size])!==(check===10?0:check))return null;
 }
 return cpf;
}
