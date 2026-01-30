# Build and test Docker script with full error output

Write-Host "=== Docker Build and Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build with full output
Write-Host "Step 1: Building Docker image..." -ForegroundColor Yellow
Write-Host "This will show all build output..." -ForegroundColor Gray
Write-Host ""

$buildOutput = docker build --progress=plain -f Dockerfile.simple -t chatgpt-clone . 2>&1

# Display output
$buildOutput | Write-Host

# Check if build succeeded
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ BUILD FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. TypeScript errors - check for type issues" -ForegroundColor Gray
    Write-Host "2. Missing dependencies - run 'npm install' locally first" -ForegroundColor Gray
    Write-Host "3. Build configuration issues" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Saving full output to docker_build_error.log..." -ForegroundColor Yellow
    $buildOutput | Out-File -FilePath docker_build_error.log
    Write-Host "Check docker_build_error.log for details" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "✓ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Run the container
Write-Host "Step 2: Starting container..." -ForegroundColor Yellow
Write-Host "Access at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Read .env file if it exists
$apiKey = ""
$baseUrl = "https://space.ai-builders.com/backend"

if (Test-Path .env) {
    $envContent = Get-Content .env
    $apiKeyLine = $envContent | Where-Object { $_ -match "^AI_BUILDER_API_KEY=" }
    $baseUrlLine = $envContent | Where-Object { $_ -match "^AI_BUILDER_BASE_URL=" }
    
    if ($apiKeyLine) {
        $apiKey = $apiKeyLine -replace "AI_BUILDER_API_KEY=", ""
    }
    if ($baseUrlLine) {
        $baseUrl = $baseUrlLine -replace "AI_BUILDER_BASE_URL=", ""
    }
}

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "⚠ No API key found in .env" -ForegroundColor Yellow
    $apiKey = Read-Host "Enter AI_BUILDER_API_KEY"
}

Write-Host ""
docker run -p 3000:3000 `
    -e AI_BUILDER_API_KEY=$apiKey `
    -e AI_BUILDER_BASE_URL=$baseUrl `
    chatgpt-clone
