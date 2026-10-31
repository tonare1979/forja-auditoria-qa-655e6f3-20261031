param([switch]$MoveClean)
$ErrorActionPreference='Stop'
$gitRoot='C:\Users\renat\forja-v11-homologaca'
$active='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$destRoot='C:\Users\renat\FORJA_BACKUPS\OUTRAS_VERSOES\WORKTREES'
$report=Join-Path $active 'docs\FORJA-WORKTREES-TRIAGEM-20261027.csv'
$lines=@(& git -C $gitRoot worktree list --porcelain)
$paths=@($lines | Where-Object {$_ -match '^worktree ' } | ForEach-Object {$_.Substring(9)})
$taskText=@(Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object TaskName -Like '*FORJA*' | ForEach-Object {$_.Actions | ForEach-Object {$_.Arguments+' '+$_.Execute}}) -join ' '
$sourceFiles=@(Get-ChildItem $active -Recurse -File -Include *.ps1,*.mjs,*.cjs,*.cmd,*.bat -ErrorAction SilentlyContinue | Where-Object {$_.FullName -notmatch '\\.git\\|node_modules|worktree-archive|inventory-|archive-build-proof|fix-scheduled-qa'})
$rows=@()
foreach($source in $paths){
 if($source -eq $gitRoot -or $source -eq $active){continue}
 $name=Split-Path $source -Leaf
 $dirty=@(& git -C $source status --porcelain 2>$null)
 $sha=(& git -C $source rev-parse HEAD 2>$null).Trim()
 $scheduled=$taskText -match [regex]::Escape($source) -or $taskText -match [regex]::Escape($name)
 $references=@($sourceFiles | Select-String -SimpleMatch -Pattern $name,$source -List -ErrorAction SilentlyContinue)
 $dest=Join-Path $destRoot $name
 $state=if($dirty.Count){'PRESERVAR-ALTERACOES'}elseif($scheduled){'PRESERVAR-TAREFA'}elseif($references.Count){'PRESERVAR-REFERENCIAS'}elseif(Test-Path $dest){'DESTINO-EXISTENTE'}else{'ELEGIVEL'}
 $rows += [pscustomobject]@{Original=$source;Destino=$dest;SHA=$sha;Pendencias=$dirty.Count;Referencias=$references.Count;Agendado=$scheduled;Estado=$state}
}
$rows|Export-Csv -LiteralPath $report -Encoding UTF8 -NoTypeInformation
Write-Output ('WORKTREES_CHECK '+$rows.Count+' ELIGIBLE='+@($rows|Where-Object Estado -eq 'ELEGIVEL').Count)
$rows|Select-Object Original,Estado,Pendencias,Referencias,Agendado|Format-Table -AutoSize|Out-String -Width 240|Write-Output
if($MoveClean){
 New-Item -Path $destRoot -ItemType Directory -Force|Out-Null
 foreach($item in $rows|Where-Object Estado -eq 'ELEGIVEL'){
  & git -C $gitRoot worktree move $item.Original $item.Destino
  if($LASTEXITCODE -ne 0){throw ('WORKTREE_MOVE_FAILED '+$item.Original)}
  $finalSha=(& git -C $item.Destino rev-parse HEAD).Trim()
  $newDirty=@(& git -C $item.Destino status --porcelain)
  if($finalSha -ne $item.SHA -or $newDirty.Count){throw ('WORKTREE_VERIFY_FAILED '+$item.Destino)}
  Write-Output ('WORKTREE_ARCHIVED '+$item.Destino+' '+$finalSha)
 }
}
