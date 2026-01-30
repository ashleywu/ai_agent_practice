# Simple Docker test script

Write-Host "=== Simple Docker Test ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Build with simple Dockerfile
Write-Host "Building with simple Dockerfile..." -ForegroundColor Yellow
docker build -f Dockerfile.simple -t chatgpt-clone-simple .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Build successful!" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "Found .env file, reading API key..." -ForegroundColor Yellow
    $envContent = Get-Content .env
    $apiKey = ($envContent | Where-Object { $_ -match "AI_BUILDER_API_KEY=" }) -replace "AI_BUILDER_API_KEY=", ""
    $baseUrl = ($envContent | Where-Object { $_ -match "AI_BUILDER_BASE_URL=" }) -replace "AI_BUILDER_BASE_URL=", ""
    
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        $apiKey = Read-Host "Enter AI_BUILDER_API_KEY"
    }
    if ([string]::IsNullOrWhiteSpace($baseUrl)) {
        $baseUrl = "https://space.ai-builders.com/backend"
    }
} else {
    Write-Host "No .env file found" -ForegroundColor Yellow
    $apiKey = Read-Host "Enter AI_BUILDER_API_KEY"
    $baseUrl = "https://space.ai-builders.com/backend"
}

Write-Host ""
Write-Host "Starting container..." -ForegroundColor Yellow
Write-Host "Access at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

docker run -p 3000:3000 `
    -e AI_BUILDER_API_KEY=$apiKey `
    -e AI_BUILDER_BASE_URL=$baseUrl `
    chatgpt-clone-simple
