$ErrorActionPreference='Stop'
$repo='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$backups='C:\Users\renat\FORJA_BACKUPS'
$current=Join-Path $backups 'FORJA_V11_RC3_GIT_20261027.bundle'
$temp=Join-Path $backups 'FORJA_V11_RC3_GIT_20261027.CANDIDATE.bundle'
$old=Join-Path $backups 'OUTRAS_VERSOES\GIT_BUNDLES\FORJA_V11_RC3_GIT_PRE_ORGANIZACAO_20261027.bundle'
Set-Location $repo
if(Test-Path $temp){throw 'TEMP_BUNDLE_EXISTS'}
& git bundle create $temp --all | Out-Null
if($LASTEXITCODE -ne 0){throw 'CREATE_BUNDLE_FAIL'}
& cmd.exe /c ('git bundle verify '+$temp+' 1>NUL 2>NUL')
if($LASTEXITCODE -ne 0){throw 'VERIFY_CANDIDATE_FAIL'}
if(Test-Path $old){throw 'OLD_BACKUP_PATH_CONFLICT'}
New-Item (Split-Path $old -Parent) -ItemType Directory -Force|Out-Null
Move-Item -LiteralPath $current -Destination $old -ErrorAction Stop
try{
 Move-Item -LiteralPath $temp -Destination $current -ErrorAction Stop
 & cmd.exe /c ('git bundle verify '+$current+' 1>NUL 2>NUL')
 if($LASTEXITCODE -ne 0){throw 'FINAL_BUNDLE_VERIFY_FAILED'}
} catch{
 if(!(Test-Path $current) -and (Test-Path $old)){Move-Item -LiteralPath $old -Destination $current -ErrorAction SilentlyContinue}
 throw
}
$sha=(Get-FileHash -LiteralPath $current -Algorithm SHA256).Hash
$commit=(& git rev-parse HEAD).Trim()
Write-Output ('BACKUP_GIT_BUNDLE_VERIFIED '+$current)
Write-Output ('BACKUP_GIT_SHA256 '+$sha)
Write-Output ('BACKUP_HEAD '+$commit)
Write-Output ('OLDER_GIT_BUNDLE_ARCHIVED '+$old)
