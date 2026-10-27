$ErrorActionPreference='Stop'
$root='C:\Users\renat\forja-v11-homologaca'
$active='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$out=Join-Path $active 'docs\FORJA-WORKTREES-SITUACAO-FINAL-20261027.csv'
$lines=@(& git -C $root worktree list --porcelain)
$paths=@($lines|Where-Object {$_ -match '^worktree '}|ForEach-Object {$_.Substring(9)})
$rows=@()
foreach($path in $paths){
 $p=$path.Replace('/','\')
 $sha=(& git -C $p rev-parse HEAD).Trim()
 $status=@(& git -C $p status --porcelain --untracked-files=normal)
 $state=if($p -ieq $root){'GIT-ANCHOR-PRESERVADO'}elseif($p -ieq $active){'FONTE-ATIVA'}elseif($p -match '\\FORJA_BACKUPS\\OUTRAS_VERSOES\\WORKTREES\\'){'HISTORICO-ARQUIVADO'}else{'HISTORICO-BLOQUEADO'}
 $rows+=[pscustomobject]@{Path=$p;SHA=$sha;Status=$state;PendingEntries=$status.Count}
}
$rows|Export-Csv $out -Encoding UTF8 -NoTypeInformation
$hist=@($rows|Where-Object Status -eq 'HISTORICO-ARQUIVADO')
$blocked=@($rows|Where-Object Status -eq 'HISTORICO-BLOQUEADO')
Write-Output ('GIT_WORKTREES_TOTAL '+$rows.Count+' ARCHIVED='+$hist.Count+' BLOCKED='+$blocked.Count)
$blocked|Format-Table|Out-String -Width 240|Write-Output
if($hist.Count -ne 26){throw ('ARCHIVE_TOTAL_MISMATCH '+$hist.Count)}
if($blocked.Count -ne 1){throw ('BLOCKED_COUNT_MISMATCH '+$blocked.Count)}
$task=(Get-ScheduledTask -TaskName 'FORJA_RC3_QA_Gratuito').Actions.Arguments
if($task -notmatch 'FORJA_RC3_E2E_WORKFLOW_20261027'){throw 'TASK_OLD_PATH'}
Write-Output 'FINAL_LAYOUT_AND_QA_TASK_PASS'
