param([switch]$Move)
$ErrorActionPreference='Stop'
$root='C:\Users\renat\forja-v11-homologaca'
$active='C:\Users\renat\FORJA_RC3_E2E_WORKFLOW_20261027'
$archive='C:\Users\renat\FORJA_BACKUPS\OUTRAS_VERSOES\WORKTREES'
$manifests='C:\Users\renat\FORJA_BACKUPS\OUTRAS_VERSOES\MANIFESTOS'
$report=Join-Path $active 'docs\FORJA-WORKTREES-PENDENTES-20261027.csv'
$lines=@(& git -C $root worktree list --porcelain)
$paths=@($lines|Where-Object {$_ -match '^worktree ' }|ForEach-Object {$_.Substring(9)})
$taskText=@(Get-ScheduledTask -ErrorAction SilentlyContinue|Where-Object TaskName -Like '*FORJA*'|ForEach-Object {$_.Actions|ForEach-Object {$_.Arguments+' '+$_.Execute}}) -join ' '
$scripts=@(Get-ChildItem $active -File -Recurse -Include *.ps1,*.mjs,*.cjs,*.cmd,*.bat -ErrorAction SilentlyContinue|Where-Object {$_.FullName -notmatch '\\.git\\|node_modules|worktree-|inventory-|archive-|fix-scheduled-qa'})
$rows=@()
foreach($source in $paths){
 $normalized=$source.Replace('/','\')
 if($normalized -ieq $root -or $normalized -ieq $active){continue}
 if($normalized -match '\\FORJA_BACKUPS\\OUTRAS_VERSOES\\'){continue}
 $name=Split-Path $normalized -Leaf
 $target=Join-Path $archive $name
 $sha=(& git -C $normalized rev-parse HEAD).Trim()
 $status=@(& git -C $normalized status --porcelain --untracked-files=all)
 $refs=@($scripts|Select-String -SimpleMatch -Pattern $normalized,$name -List -ErrorAction SilentlyContinue)
 $scheduled=$taskText -match [regex]::Escape($normalized) -or $taskText -match [regex]::Escape($name)
 $state=if($status.Count -eq 0){'CLEAN-USE-FIRST-SCRIPT'}elseif($scheduled){'BLOCKED-SCHEDULE'}elseif($refs.Count){'BLOCKED-CODE-REF'}elseif(Test-Path $target){'BLOCKED-DEST-EXISTS'}else{'ELIGIBLE-DIRTY'}
 $rows+=[pscustomobject]@{Source=$normalized;Destination=$target;SHA=$sha;Entries=$status.Count;References=$refs.Count;Scheduled=$scheduled;State=$state}
}
$rows|Export-Csv -LiteralPath $report -NoTypeInformation -Encoding UTF8
Write-Output ('DIRTY_TRIAGE '+$rows.Count+' eligible='+@($rows|Where-Object State -eq 'ELIGIBLE-DIRTY').Count)
$rows|Select-Object Source,Entries,State|Format-Table -AutoSize|Out-String -Width 230|Write-Output
if(!$Move){exit 0}
New-Item $archive -ItemType Directory -Force|Out-Null
New-Item $manifests -ItemType Directory -Force|Out-Null
foreach($item in ($rows|Where-Object State -eq 'ELIGIBLE-DIRTY')){
 $files=@(Get-ChildItem -LiteralPath $item.Source -Recurse -File -Force -ErrorAction Stop | Where-Object {$_.FullName -ne (Join-Path $item.Source '.git')})
 $manifest=Join-Path $manifests ($item.Source.Split('\')[-1]+'.sha256.csv')
 $entries=@(foreach($f in $files){[pscustomobject]@{Relative=$f.FullName.Substring($item.Source.Length+1);Bytes=$f.Length;SHA256=(Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash}})
 $entries|Export-Csv -LiteralPath $manifest -NoTypeInformation -Encoding UTF8
 $before=@(& git -C $item.Source status --porcelain --untracked-files=all)
 & git -C $root worktree move $item.Source $item.Destination
 if($LASTEXITCODE -ne 0){
  if((Test-Path $item.Source) -and !(Test-Path $item.Destination)){
   $unchangedSha=(& git -C $item.Source rev-parse HEAD).Trim()
   if($unchangedSha -eq $item.SHA){Write-Output ('MOVE_BLOCKED_PRESERVED '+$item.Source);continue}
  }
  throw ('MOVE_ERROR_UNCERTAIN_STATE '+$item.Source)
 }
 $shaAfter=(& git -C $item.Destination rev-parse HEAD).Trim()
 $after=@(& git -C $item.Destination status --porcelain --untracked-files=all)
 if($shaAfter -ne $item.SHA -or (($before -join "`n") -ne ($after -join "`n"))){throw ('GIT_STATUS_CHANGE '+$item.Destination)}
 $newFiles=@(Get-ChildItem -LiteralPath $item.Destination -Recurse -File -Force | Where-Object {$_.FullName -ne (Join-Path $item.Destination '.git')})
 if($newFiles.Count -ne $entries.Count){throw ('COUNT_CHANGE '+$item.Destination)}
 foreach($entry in $entries){$file=Join-Path $item.Destination $entry.Relative;if(!(Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $entry.SHA256){throw ('HASH_CHANGE '+$file)}}
 Write-Output ('ARCHIVED_DIRTY '+$item.Destination+' SHA='+$shaAfter+' FILES='+$entries.Count+' DIRTY_ENTRIES='+$after.Count)
}
