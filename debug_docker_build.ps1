# Debug Docker build script

Write-Host "=== Docker Build Debug ===" -ForegroundColor Cyan
Write-Host ""

# Build with verbose output and save to file
Write-Host "Building Docker image with full output..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

docker build --progress=plain --no-cache -f Dockerfile.simple -t chatgpt-clone . 2>&1 | Tee-Object -FilePath docker_build.log

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Cyan
    Write-Host 'docker run -p 3000:3000 -e AI_BUILDER_API_KEY=your_key -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend chatgpt-clone' -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host "Check docker_build.log for details" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Last 50 lines of build output:" -ForegroundColor Cyan
    Get-Content docker_build.log -Tail 50
}
