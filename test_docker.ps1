# PowerShell script to test Docker build and run

Write-Host "=== Docker Test Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t chatgpt-clone .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful!" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (Test-Path .env) {
    Write-Host "✓ Found .env file" -ForegroundColor Green
    $useEnv = Read-Host "Use .env file for environment variables? (Y/n)"
    if ($useEnv -ne "n" -and $useEnv -ne "N") {
        Write-Host "Starting container with docker-compose..." -ForegroundColor Yellow
        docker-compose up
        exit 0
    }
} else {
    Write-Host "⚠ No .env file found" -ForegroundColor Yellow
}

# Ask for API key
Write-Host ""
$apiKey = Read-Host "Enter AI_BUILDER_API_KEY (or press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "⚠ Running without API key (will fail API calls)" -ForegroundColor Yellow
    $apiKey = "dummy_key"
}

Write-Host ""
Write-Host "Starting container..." -ForegroundColor Yellow
Write-Host "Access the app at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

docker run -p 3000:3000 `
    -e AI_BUILDER_API_KEY=$apiKey `
    -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend `
    chatgpt-clone
