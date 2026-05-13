param(
  [string[]]$Files,
  [switch]$All
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-SupabaseCliInvocation {
  $command = Get-Command supabase -ErrorAction SilentlyContinue
  if ($command -and $command.Source) {
    return @{
      Command = $command.Source
      PrefixArgs = @()
    }
  }

  $fallbackPath = Join-Path $env:LOCALAPPDATA 'Programs\SupabaseCLI\supabase.exe'
  if (Test-Path $fallbackPath) {
    return @{
      Command = $fallbackPath
      PrefixArgs = @()
    }
  }

  $npxCommand = Get-Command 'npx.cmd' -ErrorAction SilentlyContinue
  if ($npxCommand -and $npxCommand.Source) {
    return @{
      Command = $npxCommand.Source
      PrefixArgs = @('--yes', 'supabase')
    }
  }

  throw 'Supabase CLI was not found on PATH, in the local fallback install location, or via npx.cmd.'
}

$orderedRepoFiles = @(
  'supabase\01_members_schema.sql',
  'supabase\02_enable_member_directory_read.sql',
  'supabase\04_backfill_birthday_parts.sql',
  'supabase\05_member_roles_and_permissions.sql',
  'supabase\06_gothicka_admin_access.sql',
  'supabase\07_admin_editor_auth_policies.sql',
  'supabase\08_events_calendar.sql',
  'supabase\10_event_type_customization.sql',
  'supabase\11_weekly_wishlists.sql',
  'supabase\12_member_owned_events.sql',
  'supabase\13_wishlist_image_uploads_and_comments.sql',
  'supabase\14_invite_code_account_claims.sql',
  'supabase\migrations\20260512000100_self_owned_posting.sql',
  'supabase\migrations\20260513000100_giveaways.sql',
  'supabase\migrations\20260513000200_staff_posting_and_giveaway_rerolls.sql'
)

if ($All) {
  $Files = $orderedRepoFiles
}

$Files = @($Files | ForEach-Object {
  if ($_ -is [string]) {
    $_ -split '[,;\r\n]'
  } else {
    $_
  }
} | ForEach-Object {
  $value = if ($_ -is [string]) { $_.Trim() } else { $_ }
  if ($value) {
    $value
  }
})

if (-not $Files -or $Files.Count -eq 0) {
  throw 'Pass -All to run the standard YAWL Hub SQL set or pass -Files with one or more SQL file paths.'
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDirectory
$supabaseCli = Get-SupabaseCliInvocation

foreach ($file in $Files) {
  $candidatePath = if ([System.IO.Path]::IsPathRooted($file)) {
    $file
  } else {
    Join-Path $repoRoot $file
  }

  if (-not (Test-Path $candidatePath)) {
    throw "SQL file not found: $file"
  }

  $fullPath = (Resolve-Path $candidatePath).Path
  Write-Host ''
  Write-Host ">>> Applying $fullPath"
  & $supabaseCli.Command @($supabaseCli.PrefixArgs + @('db', 'query', '--linked', '-f', $fullPath, '--output', 'table'))

  if ($LASTEXITCODE -ne 0) {
    throw "Supabase query failed for $fullPath with exit code $LASTEXITCODE."
  }
}

Write-Host ''
Write-Host 'Finished applying the selected SQL files.'
