$ErrorActionPreference='Stop'
$base='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$rows=Import-Csv (Join-Path $base 'docs\FORJA-WORKTREES-TRIAGEM-20261027.csv')|Where-Object Estado -eq 'ELEGIVEL'
$verified=@()
foreach($item in $rows){
 if(Test-Path $item.Original){throw ('SOURCE_STILL_PRESENT '+$item.Original)}
 if(!(Test-Path $item.Destino)){throw ('DEST_MISSING '+$item.Destino)}
 $sha=(& git -C $item.Destino rev-parse HEAD).Trim()
 $dirty=@(& git -C $item.Destino status --porcelain)
 if($sha -ne $item.SHA -or $dirty.Count){throw ('WORKTREE_CORRUPTED '+$item.Destino)}
 $verified+=[pscustomobject]@{Origem=$item.Original;Destino=$item.Destino;SHA=$sha;Estado='ARQUIVADO-E-VERIFICADO'}
}
$manifest=Join-Path $base 'docs\FORJA-ARQUIVAMENTO-WORKTREES-20261027.csv'
$verified|Export-Csv -LiteralPath $manifest -NoTypeInformation -Encoding UTF8
Write-Output ('ARCHIVE_VERIFIED '+$verified.Count+' '+$manifest)
$scheduled=(Get-ScheduledTask -TaskName 'FORJA_RC3_QA_Gratuito').Actions.Arguments
if($scheduled -notmatch 'FORJA_RC3_E2E_WORKFLOW_20261027'){throw 'QA_TASK_DRIFT'}
Write-Output 'QA_SCHEDULED_TASK_POINTS_TO_ACTIVE_PASS'
