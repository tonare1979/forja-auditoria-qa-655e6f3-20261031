$ErrorActionPreference='Stop'
$name='FORJA_RC3_QA_Gratuito'
$script='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027\ops\forja-qa-daily.ps1'
if(!(Test-Path $script)){throw 'ACTIVE_SCRIPT_NOT_FOUND'}
$task=Get-ScheduledTask -TaskName $name -ErrorAction Stop
$oldAction=$task.Actions|Select-Object -First 1
Write-Output ('OLD_ARGUMENTS '+$oldAction.Arguments)
$action=New-ScheduledTaskAction -Execute 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$script+'"')
Set-ScheduledTask -TaskName $name -Action $action -ErrorAction Stop|Out-Null
$new=Get-ScheduledTask -TaskName $name -ErrorAction Stop
if(($new.Actions|Select-Object -First 1).Arguments -notmatch 'FORJA_RC3_E2E_WORKFLOW_20261027'){throw 'TASK_PATH_VERIFY_FAILED'}
Write-Output ('TASK_PATH_UPDATED '+($new.Actions|Select-Object -First 1).Arguments)
