from pathlib import Path
import subprocess, os, json
root=Path('/workspace/scratch/6d12d3cc29ee/forja')
paths=['public/scout-progress.js','public/sw.js','tests/run-qa-batch.mjs']
changed={p:(root/p).read_bytes() for p in paths}
env=os.environ.copy()
env['NODE_PATH']=env['CODEX_PRIMARY_RUNTIME_NODE_MODULES']
env['FORJA_QA_MODE']='candidate'
out=root/'docs/evidencias/qa-verde-20261027'
out.mkdir(parents=True,exist_ok=True)
try:
 for p in paths:
  (root/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p],cwd=root))
 result=subprocess.run(['node','tests/run-qa-batch.mjs'],cwd=root,env=env,capture_output=True,text=True)
 (out/'baseline.log').write_text(result.stdout+result.stderr)
 print('BASELINE_EXIT',result.returncode,flush=True)
 print(result.stdout,flush=True)
finally:
 for p,b in changed.items(): (root/p).write_bytes(b)
result=subprocess.run(['node','tests/run-qa-batch.mjs'],cwd=root,env=env,capture_output=True,text=True)
(out/'candidate.log').write_text(result.stdout+result.stderr)
print('CANDIDATE_EXIT',result.returncode,flush=True)
print(result.stdout,flush=True)
