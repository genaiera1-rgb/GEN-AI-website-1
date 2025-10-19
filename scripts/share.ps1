Param(
  [int]$Port = 5500
)

# Check cloudflared
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
  Write-Host "cloudflared not found. Install with: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
  exit 1
}

Write-Host "Opening Cloudflare quick tunnel for http://localhost:$Port ..." -ForegroundColor Cyan
& cloudflared tunnel --url "http://localhost:$Port"
