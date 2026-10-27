$ErrorActionPreference='Stop'
$patterns='FORJA_RC3_E2E_ISOLATED_20261027|FORJA_RC3_E2E_A2_20261027'
$targets=@(Get-CimInstance Win32_Process -Filter "name = 'node.exe'"|Where-Object {$_.CommandLine -match $patterns -and $_.CommandLine -match 'wrangler.*dev --local'})
Write-Output ('LOCAL_QA_WRANGLER_TO_STOP '+$targets.Count)
foreach($t in $targets){
 Write-Output ('STOP_OLD_QA_PID '+$t.ProcessId)
 Stop-Process -Id $t.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
$remaining=@(Get-CimInstance Win32_Process -Filter "name = 'node.exe'"|Where-Object {$_.CommandLine -match $patterns -and $_.CommandLine -match 'wrangler.*dev --local'})
if($remaining.Count){throw ('LOCAL_QA_REMAINS '+$remaining.Count)}
Write-Output 'ONLY_OLD_LOCAL_QA_SERVERS_STOPPED_PASS'
