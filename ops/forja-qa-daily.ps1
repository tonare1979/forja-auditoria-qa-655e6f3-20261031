# FORJA RC3 — QA local automatico, gratuito e nao destrutivo.
param([switch]$Force)
$ErrorActionPreference='Stop'
$repo='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$node='C:\Program Files\nodejs\node.exe'
$reports='C:\Users\renat\FORJA_PLAYWRIGHT_QA\reports'
$lock=Join-Path $reports 'forja-qa-daily.lock'
New-Item -Path $reports -ItemType Directory -Force | Out-Null
if(!(Test-Path $repo) -or !(Test-Path $node)){Write-Error 'FORJA_QA_MISSING_DEPENDENCY';exit 10}
if(Test-Path $lock){
  if(((Get-Date)-(Get-Item $lock).LastWriteTime).TotalMinutes -lt 45){Write-Output 'FORJA_QA_ALREADY_RUNNING_SKIP';exit 0}
  Remove-Item $lock -Force
}
if(!$Force){
  # Agendamento a cada 2 horas: evita apenas repeticoes acidentais dentro de 110 minutos.
  $recent=Get-ChildItem $reports -Filter 'forja-qa-batch-*.json' -File | Sort-Object LastWriteTime -Descending | Where-Object {
    try{$result=Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8 | ConvertFrom-Json; $result.branch -eq 'fix/rc3-equipment-thumb-contain-20261027' -and $result.mode -eq 'candidate'}catch{$false}
  } | Select-Object -First 1
  if($recent -and ((Get-Date)-$recent.LastWriteTime).TotalMinutes -lt 110){Write-Output ('FORJA_QA_RECENT_CANDIDATE_RUN_SKIP '+$recent.Name);exit 0}
}
try{$fh=[System.IO.File]::Open($lock,[System.IO.FileMode]::CreateNew);$fh.Close()}catch{Write-Output 'FORJA_QA_LOCK_SKIP';exit 0}
$log=Join-Path $reports ('forja-qa-daily-'+(Get-Date -Format 'yyyyMMdd_HHmmss')+'.log')
$exit=1
try{
  Push-Location $repo
  try{
    $env:NODE_PATH='C:\Users\renat\FORJA_PLAYWRIGHT_QA\node_modules'
    $env:FORJA_QA_MODE='candidate'
    $currentBranch=(& git branch --show-current).Trim()
    $currentSha=(& git rev-parse HEAD).Trim()
    if($LASTEXITCODE -ne 0 -or $currentBranch -ne 'fix/rc3-equipment-thumb-contain-20261027'){throw 'FORJA_QA_WRONG_BRANCH'}
    Write-Output ('FORJA_QA_SOURCE '+$currentBranch+' '+$currentSha) | Out-File -LiteralPath $log -Encoding utf8
    Write-Output 'FORJA_QA_BROWSER_SCOPE code-only; Safari=iPhone pending; Edge=Windows pending' | Out-File -LiteralPath $log -Append -Encoding utf8
    & $node 'tests\run-qa-batch.mjs' *>&1 | Out-File -LiteralPath $log -Append -Encoding utf8
    $exit=$LASTEXITCODE
    if($null -eq $exit){$exit=1}
    # Atualiza o resumo sem rodar a bateria outra vez, mesmo se houve falhas no QA.
    & $node 'ops\forja-status.mjs' --write *>&1 | Out-File -LiteralPath $log -Append -Encoding utf8
    $statusExit=$LASTEXITCODE
    if($null -eq $statusExit){$statusExit=1}
    if($statusExit -ne 0){Write-Output ('FORJA_STATUS_GENERATION_FAILED '+$statusExit);if($exit -eq 0){$exit=$statusExit}}
    Select-String -LiteralPath $log -Pattern 'BATCH_RESULT|EVIDENCIA_LOCAL' | ForEach-Object{Write-Output $_.Line}
    Write-Output ('FORJA_STATUS_SNAPSHOT '+(Join-Path $reports 'forja-status-latest.json'))
    Write-Output ('FORJA_QA_LOG '+$log)
  }finally{Pop-Location}
}finally{Remove-Item -LiteralPath $lock -ErrorAction SilentlyContinue}
if($exit -ne 0){Write-Error ('FORJA_QA_BATCH_FAILED exit='+$exit);exit $exit}
exit 0
