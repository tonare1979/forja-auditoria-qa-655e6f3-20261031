$ErrorActionPreference='Stop'
$root='C:\Users\renat'
$active=Join-Path $root 'FORJA_RC3_E2E_WORKFLOW_20261027'
$out=Join-Path $active 'docs\FORJA-INVENTARIO-PASTAS-20261027.csv'
$dirs=@(Get-ChildItem $root -Directory | Where-Object Name -Like '*FORJA*')
$desktop=Join-Path $root 'Desktop\FORJA_RC3_TRANSFERENCIA'
if(Test-Path $desktop){$dirs+=Get-Item $desktop}
$rows=@()
foreach($dir in $dirs){
  $files=Get-ChildItem -LiteralPath $dir.FullName -File -Recurse -ErrorAction SilentlyContinue
  $count=@($files).Count
  $size=($files | Measure-Object Length -Sum).Sum
  $git=Test-Path (Join-Path $dir.FullName '.git')
  $candidate=if($dir.FullName -eq $active){'ATIVO'}elseif($dir.Name -match 'BACKUPS|RECUPERACAO'){ 'BACKUP-PRESERVAR' }elseif($dir.Name -match 'PLAYWRIGHT'){ 'QA-PRESERVAR' }else{'TRIAGEM-SEM-MOVER'}
  $rows += [PSCustomObject]@{Path=$dir.FullName;Files=$count;Bytes=[long]$size;Git=$git;Classification=$candidate;Latest=($files|Sort-Object LastWriteTime -Descending|Select-Object -First 1 -ExpandProperty LastWriteTime -ErrorAction SilentlyContinue)}
}
$rows|Export-Csv -LiteralPath $out -NoTypeInformation -Encoding UTF8
Write-Output ('INVENTORY_COMPLETE '+$rows.Count+' folders '+$out)
$rows|Sort-Object Bytes -Descending|Select-Object Path,Files,Bytes,Classification|Format-Table -AutoSize|Out-String -Width 240|Write-Output
