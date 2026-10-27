$ErrorActionPreference='Continue'
$base='C:\Users\renat'
$out='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027\docs\FORJA-INVENTARIO-GIT-20261027.csv'
$dirs=@(Get-ChildItem $base -Directory | Where-Object Name -Like '*FORJA*')
$dirs+=Get-Item 'C:\Users\renat\Desktop\FORJA_RC3_TRANSFERENCIA'
$rows=@()
foreach($dir in $dirs){
 $gitdir=Join-Path $dir.FullName '.git'
 $isGit=Test-Path $gitdir
 $sha='';$branch='';$remote=''
 if($isGit){
  $sha=(& git -C $dir.FullName rev-parse --short HEAD 2>$null)
  $branch=(& git -C $dir.FullName branch --show-current 2>$null)
  $remote=(& git -C $dir.FullName remote get-url origin 2>$null)
 }
 $rows += [PSCustomObject]@{Path=$dir.FullName;Git=$isGit;SHA=("$sha").Trim();Branch=("$branch").Trim();Remote=("$remote").Trim()}
}
$rows|Export-Csv -LiteralPath $out -NoTypeInformation -Encoding UTF8
Write-Output ('GIT_INVENTORY_COMPLETE '+$rows.Count+' '+$out)
$rows|Format-Table -AutoSize|Out-String -Width 240|Write-Output
