# Test Docker build with full output

Write-Host "=== Testing Docker Build ===" -ForegroundColor Cyan
Write-Host ""

# Temporarily rename next.config.js to use test version
Write-Host "Using test config (no standalone)..." -ForegroundColor Yellow
Copy-Item next.config.js next.config.js.backup -ErrorAction SilentlyContinue
Copy-Item next.config.test.js next.config.js -Force

try {
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    Write-Host "Watch for the actual error message..." -ForegroundColor Gray
    Write-Host ""
    
    docker build --progress=plain -f Dockerfile.test -t chatgpt-clone-test . 2>&1 | Tee-Object -FilePath docker_test_build.log
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To run:" -ForegroundColor Cyan
        Write-Host 'docker run -p 3000:3000 -e AI_BUILDER_API_KEY=your_key -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend chatgpt-clone-test' -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "✗ Build failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "=== Last 100 lines of build output ===" -ForegroundColor Cyan
        Get-Content docker_test_build.log -Tail 100 | Write-Host
        Write-Host ""
        Write-Host "Full log saved to: docker_test_build.log" -ForegroundColor Yellow
    }
} finally {
    # Restore original config
    Write-Host ""
    Write-Host "Restoring original config..." -ForegroundColor Gray
    Copy-Item next.config.js.backup next.config.js -Force -ErrorAction SilentlyContinue
    Remove-Item next.config.js.backup -ErrorAction SilentlyContinue
}
