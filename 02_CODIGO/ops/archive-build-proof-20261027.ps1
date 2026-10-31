$ErrorActionPreference='Stop'
$root='C:\Users\renat'
$active=Join-Path $root 'FORJA_RC3_E2E_WORKFLOW_20261027'
$target=Join-Path $root 'FORJA_BACKUPS\OUTRAS_VERSOES'
$names=@('FORJA_RC3_BUILD_PROOF_20261027','FORJA_RC3_BUILD_PROOF_NAME_20261027')
$proof=Join-Path $active 'docs\FORJA-ARQUIVAMENTO-PROVAS-20261027.csv'
$rows=@()
foreach($name in $names){
 $source=Join-Path $root $name
 $dest=Join-Path $target $name
 if(!(Test-Path $source)){throw ('SOURCE_MISSING '+$source)}
 if(Test-Path $dest){throw ('DEST_EXISTS '+$dest)}
 $files=@(Get-ChildItem $source -File -Recurse)
 if(Test-Path (Join-Path $source '.git')){throw ('GIT_TREE_BLOCK '+$source)}
 $hits=@(Get-ChildItem $active -Include *.ps1,*.mjs,*.cjs,*.json,*.md -File -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules|\\.git\\|archive-build-proof-20261027.ps1|FORJA-REGISTRO-MESTRE|FORJA-INVENTARIO' } | Select-String -SimpleMatch $name -List -ErrorAction SilentlyContinue)
 if($hits.Count -gt 0){Write-Output ('ACTIVE_REFERENCE_BLOCK '+$name+' '+$hits.Count);continue}
 foreach($f in $files){$rows+=[PSCustomObject]@{Source=$f.FullName;Relative=$f.FullName.Substring($source.Length+1);Sha256=(Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash;Archive=$dest}}
 Write-Output ('ARCHIVE_CANDIDATE '+$name+' FILES='+$files.Count)
}
if($rows.Count -gt 0){New-Item $target -ItemType Directory -Force|Out-Null;$rows|Export-Csv -LiteralPath $proof -NoTypeInformation -Encoding UTF8
 foreach($name in $names){$source=Join-Path $root $name;$dest=Join-Path $target $name; if(($rows|Where-Object Archive -eq $dest).Count -gt 0){Move-Item -LiteralPath $source -Destination $dest -ErrorAction Stop;Write-Output ('ARCHIVED '+$dest)}}
 foreach($item in $rows){$f=Join-Path $item.Archive $item.Relative;if((Get-FileHash -LiteralPath $f -Algorithm SHA256).Hash -ne $item.Sha256){throw ('HASH_MISMATCH '+$f)}}
 Write-Output ('ARCHIVE_HASH_VERIFIED '+$rows.Count)
}
