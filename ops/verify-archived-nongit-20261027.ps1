$ErrorActionPreference='Stop'
$homeRoot='C:\Users\renat'
$archive=Join-Path $homeRoot 'FORJA_BACKUPS\OUTRAS_VERSOES\DOCUMENTOS-EVIDENCIAS'
$manifestRoot=Join-Path $homeRoot 'FORJA_BACKUPS\OUTRAS_VERSOES\MANIFESTOS'
$names=@('FORJA_RC3_E2E_A2_20261027','FORJA_RC3_E2E_ISOLATED_20261027','FORJA_RC3_TRANSFERENCIA')
$rows=@()
foreach($name in $names){
 $dest=Join-Path $archive $name
 $manifest=Join-Path $manifestRoot ($name+'.sha256.csv')
 if(!(Test-Path $dest) -or !(Test-Path $manifest)){throw ('ARCHIVE_MISSING '+$name)}
 $files=@(Import-Csv -LiteralPath $manifest)
 foreach($file in $files){
  $p=Join-Path $dest $file.Relative
  if(!(Test-Path -LiteralPath $p)){throw ('FILE_MISSING '+$p)}
  $sha=(Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash
  if($sha -ne $file.SHA256){throw ('HASH_MISMATCH '+$p)}
 }
 $rows+=[pscustomobject]@{Directory=$name;Location=$dest;Files=$files.Count;Status='ARCHIVED-VERIFIED'}
 Write-Output ('ARCHIVE_VERIFIED '+$name+' FILES='+$files.Count)
}
$out=Join-Path $homeRoot 'FORJA_RC3_E2E_WORKFLOW_20261027\docs\FORJA-ARQUIVAMENTO-LEGADO-20261027.csv'
$rows|Export-Csv $out -NoTypeInformation -Encoding UTF8
Write-Output ('NON_GIT_TOTAL '+$rows.Count+' FILES='+(($rows|Measure-Object Files -Sum).Sum))
