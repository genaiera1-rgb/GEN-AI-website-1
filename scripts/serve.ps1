Param(
  [int]$Port = 5500
)

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Try Python first (python or py)
$py = Get-Command python -ErrorAction SilentlyContinue
$pycmd = $null
if ($py) { $pycmd = 'python' } else {
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { $pycmd = 'py' }
}

if ($pycmd) {
  Write-Host "Starting local server on http://localhost:$Port (Python)" -ForegroundColor Cyan
  & $pycmd -m http.server $Port
  return
}

# Fallback: lightweight PowerShell static file server (HttpListener)
Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Starting local server on $prefix (PowerShell)" -ForegroundColor Cyan

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.htm'  { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.gif'  { 'image/gif' }
    '.svg'  { 'image/svg+xml' }
    '.webp' { 'image/webp' }
    '.ico'  { 'image/x-icon' }
    default { 'application/octet-stream' }
  }
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = [System.Web.HttpUtility]::UrlDecode($request.Url.LocalPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($localPath)) { $localPath = 'index.html' }
    $filePath = Join-Path $root $localPath
    if ((Test-Path $filePath) -and -not (Test-Path $filePath -PathType Container)) {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = Get-ContentType $filePath
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } catch {
        $response.StatusCode = 500
        $err = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
        $response.OutputStream.Write($err, 0, $err.Length)
      }
    } else {
      # Try directory default
      if (Test-Path (Join-Path $filePath 'index.html')) {
        $filePath = Join-Path $filePath 'index.html'
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = 'text/html; charset=utf-8'
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
      }
    }
    $response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
