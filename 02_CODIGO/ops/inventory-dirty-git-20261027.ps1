$root='C:\Users\renat';$out='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027\docs\FORJA-INVENTARIO-ALTERACOES-20261027.csv';$rows=@()
foreach($dir in @(Get-ChildItem $root -Directory|Where-Object Name -Like '*FORJA*')){
 if(!(Test-Path (Join-Path $dir.FullName '.git'))){continue}
 $dirty=@(& git -C $dir.FullName status --porcelain --untracked-files=normal 2>$null)
 $rows+=[PSCustomObject]@{Folder=$dir.Name;PendingEntries=$dirty.Count;Examples=($dirty|Select-Object -First 4) -join ' | '}
}
$rows|Export-Csv -LiteralPath $out -NoTypeInformation -Encoding UTF8
$rows|Format-Table -AutoSize|Out-String -Width 240|Write-Output
