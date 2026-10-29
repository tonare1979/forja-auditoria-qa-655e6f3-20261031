[CmdletBinding()]
param(
  [string]$Repo='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027',
  [string]$Backups='C:\Users\renat\FORJA_BACKUPS',
  [string]$BundleName='FORJA_V11_RC3_GIT_20261027.bundle',
  [ValidateSet('','candidate','promote','final')][string]$InjectFailure='',
  [switch]$SyntheticTest
)
$ErrorActionPreference='Stop'
if($InjectFailure -and -not $SyntheticTest){throw 'FAILURE_INJECTION_REQUIRES_SYNTHETIC_TEST'}
if(-not (Test-Path -LiteralPath (Join-Path $Repo '.git'))){throw 'REPO_NOT_FOUND_OR_NOT_GIT'}
if(-not (Test-Path -LiteralPath $Backups)){throw 'BACKUP_DIRECTORY_NOT_FOUND'}
$current=Join-Path $Backups $BundleName
$temp=Join-Path $Backups ($BundleName+'.CANDIDATE')
$archiveDir=Join-Path $Backups 'OUTRAS_VERSOES\GIT_BUNDLES'
$nonce=[guid]::NewGuid().ToString('N')
$prior=Join-Path $archiveDir ($BundleName+'.PREVIOUS.'+$nonce)
$failed=Join-Path $Backups ($BundleName+'.FAILED.'+$nonce)
if(Test-Path -LiteralPath $temp){throw 'TEMP_BUNDLE_EXISTS'}
if(-not (Test-Path -LiteralPath $current)){throw 'CURRENT_BACKUP_MISSING'}
function Test-Bundle([string]$path){
  & git -C $Repo bundle verify $path 2>&1 | Out-Null
  if($LASTEXITCODE -ne 0){throw ('BUNDLE_VERIFY_FAILED '+$path)}
}
# Never disturb the current backup until the candidate is independently verified.
& git -C $Repo bundle create $temp --all
if($LASTEXITCODE -ne 0){throw 'CREATE_BUNDLE_FAIL'}
if($InjectFailure -eq 'candidate'){Set-Content -LiteralPath $temp -Value 'synthetic-corruption' -NoNewline}
Test-Bundle $temp
New-Item -Path $archiveDir -ItemType Directory -Force | Out-Null
$promoted=$false
$priorMoved=$false
try {
  Move-Item -LiteralPath $current -Destination $prior -ErrorAction Stop
  $priorMoved=$true
  if($InjectFailure -eq 'promote'){throw 'INJECTED_PROMOTION_FAILURE'}
  Move-Item -LiteralPath $temp -Destination $current -ErrorAction Stop
  $promoted=$true
  if($InjectFailure -eq 'final'){Set-Content -LiteralPath $current -Value 'synthetic-corruption' -NoNewline}
  Test-Bundle $current
} catch {
  $rootError=$_.Exception.Message
  if($promoted -and (Test-Path -LiteralPath $current)){
    Move-Item -LiteralPath $current -Destination $failed -ErrorAction Stop
  }
  if($priorMoved){
    if(Test-Path -LiteralPath $current){throw ('ROLLBACK_DESTINATION_OCCUPIED; preserved '+$prior+'; original '+$rootError)}
    try { Move-Item -LiteralPath $prior -Destination $current -ErrorAction Stop }
    catch {throw ('ROLLBACK_FAILED; previous preserved at '+$prior+'; original '+$rootError+'; rollback '+$_.Exception.Message)}
  }
  throw ('BACKUP_PROMOTION_ABORTED '+$rootError)
}
Write-Output ('BACKUP_GIT_BUNDLE_VERIFIED '+$current)
Write-Output ('BACKUP_GIT_SHA256 '+(Get-FileHash -LiteralPath $current -Algorithm SHA256).Hash)
Write-Output ('BACKUP_HEAD '+(& git -C $Repo rev-parse HEAD).Trim())
Write-Output ('OLDER_GIT_BUNDLE_ARCHIVED '+$prior)
