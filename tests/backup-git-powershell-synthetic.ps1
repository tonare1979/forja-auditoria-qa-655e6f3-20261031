$ErrorActionPreference='Stop'
# Keep the independent Git assertion on the native command path. Only this
# capture uses Continue; success still requires the actual Git exit code 0.
function Assert-ValidBundle([string]$repoPath,[string]$bundlePath){
  $previousPreference=$ErrorActionPreference
  try {
    $ErrorActionPreference='Continue'
    $output=& git -C $repoPath bundle verify $bundlePath 2>&1
    $code=$LASTEXITCODE
  } finally {$ErrorActionPreference=$previousPreference}
  if($code -ne 0){throw ('INDEPENDENT_BUNDLE_VERIFY_FAILED '+$bundlePath+'; '+($output|Out-String))}
}
$script=Join-Path (Split-Path $PSScriptRoot -Parent) 'ops/refresh-verified-git-backup-20261027.ps1'
$root=Join-Path ([System.IO.Path]::GetTempPath()) ('forja-backup-drill-'+[guid]::NewGuid().ToString('N'))
$repo=Join-Path $root 'repo with spaces';$backup=Join-Path $root 'backup with spaces'
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
    $failureMessage=''
    try { & $script -Repo $repo -Backups $backup -BundleName 'synthetic.bundle' -SyntheticTest -InjectFailure $stage; if($LASTEXITCODE){throw 'script failed'} }
    catch {$failed=$true;$failureMessage=$_.Exception.Message}
    if(-not $failed){throw ('FAILURE_NOT_TRIGGERED '+$stage)}
    $expected=@{candidate='BUNDLE_VERIFY_FAILED';promote='BACKUP_PROMOTION_ABORTED INJECTED_PROMOTION_FAILURE';final='BACKUP_PROMOTION_ABORTED BUNDLE_VERIFY_FAILED'}[$stage]
    if(-not $failureMessage.Contains($expected)){throw ('UNEXPECTED_FAILURE '+$stage+'; '+$failureMessage)}
    if((Get-FileHash $current -Algorithm SHA256).Hash -ne $initial){throw ('PRIOR_CHANGED '+$stage)}
    Assert-ValidBundle $repo $current
    $candidate=Join-Path $backup 'synthetic.bundle.CANDIDATE'
    if(Test-Path $candidate){Remove-Item $candidate -Force}
    Write-Output ('PASS '+$stage+' previous SHA unchanged and bundle valid')
  }
  & $script -Repo $repo -Backups $backup -BundleName 'synthetic.bundle'
  if((Get-FileHash $current -Algorithm SHA256).Hash -eq $initial){throw 'SUCCESS_NOT_PROMOTED'}
  Assert-ValidBundle $repo $current
  Write-Output 'PASS success candidate promoted and valid'
  $invalid=Join-Path $backup 'invalid.bundle'
  Set-Content -LiteralPath $invalid -Value 'synthetic-corruption' -NoNewline
  $rejected=$false
  try {Assert-ValidBundle $repo $invalid} catch {$rejected=$true}
  if(-not $rejected){throw 'INVALID_BUNDLE_ACCEPTED'}
  if($ErrorActionPreference -ne 'Stop'){throw 'ERROR_PREFERENCE_NOT_RESTORED'}
  Write-Output 'PASS invalid bundle rejected and Stop preference preserved'
  Write-Output 'BACKUP_SYNTHETIC_ALL_PASS'
} finally {Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue}
