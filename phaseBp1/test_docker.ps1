# PowerShell script for testing Docker deployment

Write-Host "=== Testing Docker Build ===" -ForegroundColor Green
docker build -t aha-catcher:test .

Write-Host ""
Write-Host "=== Testing Docker Run ===" -ForegroundColor Green
docker run -d `
  --name aha-catcher-test `
  -p 8000:8000 `
  -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend `
  -e AI_BUILDER_API_KEY=sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae `
  aha-catcher:test

Write-Host ""
Write-Host "Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Testing Health Endpoint ===" -ForegroundColor Green
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host ""
Write-Host "=== Testing Root Endpoint ===" -ForegroundColor Green
Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing | Select-Object StatusCode, StatusDescription

Write-Host ""
Write-Host "=== Container Status ===" -ForegroundColor Green
docker ps | Select-String aha-catcher-test

Write-Host ""
Write-Host "=== To stop and remove container ===" -ForegroundColor Yellow
Write-Host "docker stop aha-catcher-test; docker rm aha-catcher-test"
