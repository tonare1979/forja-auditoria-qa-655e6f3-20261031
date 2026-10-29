$ErrorActionPreference='Stop'
$script=Join-Path (Split-Path $PSScriptRoot -Parent) 'ops/refresh-verified-git-backup-20261027.ps1'
$root=Join-Path ([System.IO.Path]::GetTempPath()) ('forja-backup-drill-'+[guid]::NewGuid().ToString('N'))
$repo=Join-Path $root 'repo';$backup=Join-Path $root 'backup'
New-Item -ItemType Directory -Force $repo,$backup|Out-Null
try {
  & git init -q $repo; if($LASTEXITCODE){throw 'git init failed'}
  & git -C $repo config user.name 'Synthetic Test'
  & git -C $repo config user.email 'synthetic@example.invalid'
  Set-Content (Join-Path $repo 'synthetic.txt') 'A'
  & git -C $repo add synthetic.txt
  & git -C $repo commit -qm 'synthetic initial'
  $current=Join-Path $backup 'synthetic.bundle'
  & git -C $repo bundle create $current --all
  if($LASTEXITCODE){throw 'bundle create failed'}
  $initial=(Get-FileHash $current -Algorithm SHA256).Hash
  Set-Content (Join-Path $repo 'synthetic.txt') 'B'
  & git -C $repo commit -qam 'synthetic next'
  foreach($stage in @('candidate','promote','final')){
    $failed=$false
    try { & $script -Repo $repo -Backups $backup -BundleName 'synthetic.bundle' -SyntheticTest -InjectFailure $stage; if($LASTEXITCODE){throw 'script failed'} }
    catch {$failed=$true}
    if(-not $failed){throw ('FAILURE_NOT_TRIGGERED '+$stage)}
    if((Get-FileHash $current -Algorithm SHA256).Hash -ne $initial){throw ('PRIOR_CHANGED '+$stage)}
    & git -C $repo bundle verify $current 2>&1|Out-Null
    if($LASTEXITCODE){throw ('PRIOR_NOT_VALID '+$stage)}
    $candidate=Join-Path $backup 'synthetic.bundle.CANDIDATE'
    if(Test-Path $candidate){Remove-Item $candidate -Force}
    Write-Output ('PASS '+$stage+' previous SHA unchanged and bundle valid')
  }
  & $script -Repo $repo -Backups $backup -BundleName 'synthetic.bundle'
  if((Get-FileHash $current -Algorithm SHA256).Hash -eq $initial){throw 'SUCCESS_NOT_PROMOTED'}
  & git -C $repo bundle verify $current 2>&1|Out-Null
  if($LASTEXITCODE){throw 'NEW_NOT_VALID'}
  Write-Output 'PASS success candidate promoted and valid'
} finally {Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue}
