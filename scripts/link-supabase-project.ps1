param(
  [string]$DatabasePassword
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-PlainTextPassword {
  $securePassword = Read-Host -Prompt 'Supabase database password' -AsSecureString
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
}

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

$projectRef = 'lwjueqljcdmdfumjeggn'
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDirectory
$supabaseCli = Get-SupabaseCliInvocation

if (-not $DatabasePassword) {
  $DatabasePassword = Read-PlainTextPassword
}

if (-not $DatabasePassword) {
  throw 'A database password is required to link the Supabase project.'
}

Push-Location $repoRoot
try {
  & $supabaseCli.Command @($supabaseCli.PrefixArgs + @('link', '--project-ref', $projectRef, '-p', $DatabasePassword))

  if ($LASTEXITCODE -ne 0) {
    throw "Supabase link failed with exit code $LASTEXITCODE."
  }
} finally {
  Pop-Location
}

Write-Host ''
Write-Host 'Supabase project linked for YAWL Hub.'
Write-Host 'Next step example:'
Write-Host '  .\scripts\apply-supabase-sql.ps1 -Files supabase\08_events_calendar.sql'