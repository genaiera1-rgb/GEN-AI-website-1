Param(
  [int]$Port = 5500,
  [string]$LogFile = $(Join-Path $PSScriptRoot 'cloudflared.log')
)

# Check cloudflared
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
  # Try common install locations
  $candidates = @(
    "$Env:ProgramFiles\\cloudflared\\cloudflared.exe",
    "$Env:ProgramFiles(x86)\\cloudflared\\cloudflared.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { $cf = $path; break }
  }
}

if (-not $cf) {
  Write-Host "cloudflared not found in PATH or common locations." -ForegroundColor Yellow
  $tmp = Join-Path $env:TEMP "cloudflared"
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $zip = Join-Path $tmp "cloudflared.zip"
  $exe = Join-Path $tmp "cloudflared.exe"
  if (-not (Test-Path $exe)) {
    Write-Host "Downloading cloudflared to temp..." -ForegroundColor Yellow
    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    try {
      Invoke-WebRequest -Uri $url -OutFile $exe -UseBasicParsing -TimeoutSec 60
    } catch {
      Write-Host "Failed to download cloudflared. Please install it manually: winget install Cloudflare.cloudflared" -ForegroundColor Red
      exit 1
    }
  }
  $cf = $exe
}

if (Test-Path $LogFile) { Remove-Item -Force $LogFile -ErrorAction SilentlyContinue }
Write-Host "Opening Cloudflare quick tunnel for http://localhost:$Port ..." -ForegroundColor Cyan
& $cf tunnel --logfile "$LogFile" --loglevel info --url "http://localhost:$Port"
