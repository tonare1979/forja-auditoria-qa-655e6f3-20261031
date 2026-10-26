# Instalacao idempotente do QA gratuito FORJA RC3 no notebook pessoal.
# 7 horarios diarios a cada 2h enquanto o notebook estiver disponivel.
$ErrorActionPreference='Stop'
$taskName='FORJA_RC3_QA_Gratuito'
$qaScript=Join-Path $PSScriptRoot 'forja-qa-daily.ps1'
if(!(Test-Path -LiteralPath $qaScript)){throw 'FORJA_QA_SCRIPT_NOT_FOUND'}
$exe=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments='-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$qaScript+'"'
$action=New-ScheduledTaskAction -Execute $exe -Argument $arguments
$hours=@('08:00','10:00','12:00','14:00','16:00','18:00','20:00')
$triggers=@($hours|ForEach-Object{New-ScheduledTaskTrigger -Daily -At $_})
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 35) -RunOnlyIfNetworkAvailable
$userId=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal=New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Description 'FORJA RC3: bateria QA local a cada 2h das 08h as 20h, custo adicional zero, sem deploy.' -Force | Out-Null
$t=Get-ScheduledTask -TaskName $taskName
$i=Get-ScheduledTaskInfo -TaskName $taskName
if(@($t.Triggers).Count -ne $hours.Count){throw ('FORJA_QA_WRONG_TRIGGERS '+@($t.Triggers).Count)}
Write-Output ('FORJA_QA_TASK_READY name='+$t.TaskName+' state='+$t.State+' user='+$t.Principal.UserId+' triggers='+@($t.Triggers).Count)
Write-Output ('FORJA_QA_NEXT_RUN '+$i.NextRunTime.ToString('yyyy-MM-dd HH:mm:ss'))
