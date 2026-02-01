# Test Docker build and run

Write-Host "=== Testing Docker Build ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t chatgpt-clone-test .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Docker image built successfully!" -ForegroundColor Green
Write-Host ""

# Load environment variables from .env file
$envVars = @{}
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $envVars[$matches[1]] = $matches[2]
        }
    }
}

Write-Host "=== Testing Docker Run ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting container on port 8000..." -ForegroundColor Yellow
Write-Host "Container will be accessible at: http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the container" -ForegroundColor Gray
Write-Host ""

# Run the container
$port = 8000
$apiKey = $envVars['AI_BUILDER_API_KEY']
$baseUrl = $envVars['AI_BUILDER_BASE_URL']

if (-not $apiKey) {
    Write-Host "[WARNING] AI_BUILDER_API_KEY not found in .env file" -ForegroundColor Yellow
    Write-Host "Container will start but API calls may fail." -ForegroundColor Yellow
    Write-Host ""
}

docker run --rm -p ${port}:8000 `
    -e PORT=8000 `
    -e AI_BUILDER_API_KEY=$apiKey `
    -e AI_BUILDER_BASE_URL=$baseUrl `
    chatgpt-clone-test
