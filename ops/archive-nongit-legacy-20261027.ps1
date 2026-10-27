$ErrorActionPreference='Stop'
if($HOME -ne 'C:\Users\renat'){throw 'UNEXPECTED_HOME'}
$active=Join-Path $home 'FORJA_RC3_E2E_WORKFLOW_20261027'
$archive=Join-Path $home 'FORJA_BACKUPS\OUTRAS_VERSOES\DOCUMENTOS-EVIDENCIAS'
$manifestDir=Join-Path $home 'FORJA_BACKUPS\OUTRAS_VERSOES\MANIFESTOS'
$candidates=@(
 (Join-Path $home 'FORJA_RC3_E2E_A2_20261027'),
 (Join-Path $home 'FORJA_RC3_E2E_ISOLATED_20261027'),
 (Join-Path $home 'Desktop\FORJA_RC3_TRANSFERENCIA')
)
$taskText=@(Get-ScheduledTask -ErrorAction SilentlyContinue|Where-Object TaskName -Like '*FORJA*'|ForEach-Object {$_.Actions|ForEach-Object {$_.Arguments+' '+$_.Execute}}) -join ' '
$scripts=@(Get-ChildItem $active -Recurse -File -Include *.ps1,*.mjs,*.cjs,*.cmd,*.bat -ErrorAction SilentlyContinue|Where-Object {$_.FullName -notmatch '\\.git\\|node_modules|archive-|inventory-|worktree-|fix-scheduled-qa'})
New-Item $archive -ItemType Directory -Force|Out-Null
New-Item $manifestDir -ItemType Directory -Force|Out-Null
$rows=@()
foreach($source in $candidates){
 $name=Split-Path $source -Leaf;$dest=Join-Path $archive $name
 if(!(Test-Path $source)){Write-Output ('SOURCE_ALREADY_MOVED '+$name);continue}
 if(Test-Path $dest){Write-Output ('DEST_EXISTS_BLOCK '+$name);continue}
 if(Test-Path (Join-Path $source '.git')){Write-Output ('GIT_PROTECT '+$name);continue}
 if($taskText -match [regex]::Escape($source) -or $taskText -match [regex]::Escape($name)){Write-Output ('SCHEDULED_BLOCK '+$name);continue}
 $refs=@($scripts|Select-String -SimpleMatch -Pattern $name,$source -List -ErrorAction SilentlyContinue)
 if($refs.Count){Write-Output ('SCRIPT_REFERENCE_BLOCK '+$name+' '+$refs.Count);continue}
 $files=@(Get-ChildItem -LiteralPath $source -Recurse -File -Force -ErrorAction Stop)
 try {$fileRows=@(foreach($f in $files){[pscustomobject]@{Relative=$f.FullName.Substring($source.Length+1);Bytes=$f.Length;SHA256=(Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256 -ErrorAction Stop).Hash}})} catch {Write-Output ('FILE_LOCK_BLOCK '+$name+' '+$_.Exception.Message);continue}
 $mf=Join-Path $manifestDir ($name+'.sha256.csv')
 $fileRows|Export-Csv $mf -Encoding UTF8 -NoTypeInformation
 Move-Item -LiteralPath $source -Destination $dest -ErrorAction Stop
 $check=@(Get-ChildItem $dest -Recurse -File -Force)
 if($check.Count -ne $fileRows.Count){throw ('ARCHIVE_COUNT_FAIL '+$name)}
 foreach($f in $fileRows){$target=Join-Path $dest $f.Relative;if((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $f.SHA256){throw ('ARCHIVE_HASH_FAIL '+$target)}}
 $rows+=[pscustomobject]@{Source=$source;Destination=$dest;Files=$fileRows.Count;Status='ARCHIVED-VERIFIED'}
 Write-Output ('LEGACY_ARCHIVED '+$name+' '+$fileRows.Count)
}
$rows|Export-Csv (Join-Path $active 'docs\FORJA-ARQUIVAMENTO-LEGADO-20261027.csv') -NoTypeInformation -Encoding UTF8
Write-Output ('LEGACY_ARCHIVE_SUMMARY '+$rows.Count)
