# Instalacao idempotente do QA gratuito do FORJA RC3 no notebook autorizado.
# Executa apenas testes locais, sem deploy e sem escrita no D1 remoto.
$ErrorActionPreference='Stop'
$taskName='FORJA_RC3_QA_Gratuito'
$qaScript=Join-Path $PSScriptRoot 'forja-qa-daily.ps1'
if(!(Test-Path -LiteralPath $qaScript)){throw 'FORJA_QA_SCRIPT_NOT_FOUND'}
$exe=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments='-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$qaScript+'"'
$action=New-ScheduledTaskAction -Execute $exe -Argument $arguments
$trigger=New-ScheduledTaskTrigger -Daily -At '20:30'
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 35) -RunOnlyIfNetworkAvailable
$userId=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal=New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'QA FORJA RC3 gratuito, sem deploy, sem escrita remota' -Force | Out-Null
$t=Get-ScheduledTask -TaskName $taskName
$i=Get-ScheduledTaskInfo -TaskName $taskName
Write-Output ('FORJA_QA_TASK_READY name='+$t.TaskName+' state='+$t.State+' user='+$t.Principal.UserId)
Write-Output ('FORJA_QA_NEXT_RUN '+$i.NextRunTime.ToString('yyyy-MM-dd HH:mm:ss'))
