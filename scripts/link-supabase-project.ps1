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

function Get-SupabaseCliPath {
  $command = Get-Command supabase -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $fallbackPath = Join-Path $env:LOCALAPPDATA 'Programs\SupabaseCLI\supabase.exe'
  if (Test-Path $fallbackPath) {
    return $fallbackPath
  }

  throw 'Supabase CLI was not found on PATH. Open a new terminal or reinstall the CLI first.'
}

$projectRef = 'lwjueqljcdmdfumjeggn'
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDirectory
$supabaseCli = Get-SupabaseCliPath

if (-not $DatabasePassword) {
  $DatabasePassword = Read-PlainTextPassword
}

if (-not $DatabasePassword) {
  throw 'A database password is required to link the Supabase project.'
}

Push-Location $repoRoot
try {
  & $supabaseCli link --project-ref $projectRef -p $DatabasePassword

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