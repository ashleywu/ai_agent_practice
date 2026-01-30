# Deploy to Vercel script

Write-Host "=== Deploying to Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Check if we can use npx
Write-Host "Using npx to run Vercel CLI (no installation needed)..." -ForegroundColor Yellow
Write-Host ""

# Deploy using npx
Write-Host "Starting deployment..." -ForegroundColor Yellow
Write-Host "You will be prompted to:" -ForegroundColor Gray
Write-Host "1. Login to Vercel (opens browser)" -ForegroundColor Gray
Write-Host "2. Authorize the CLI" -ForegroundColor Gray
Write-Host "3. Answer deployment questions" -ForegroundColor Gray
Write-Host ""

npx vercel@latest

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Set environment variables in Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "2. Select your project" -ForegroundColor Cyan
    Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host "4. Add:" -ForegroundColor Cyan
    Write-Host "   - AI_BUILDER_API_KEY = your_api_key" -ForegroundColor Gray
    Write-Host "   - AI_BUILDER_BASE_URL = https://space.ai-builders.com/backend" -ForegroundColor Gray
    Write-Host "5. Redeploy: npx vercel --prod" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Deployment failed or cancelled" -ForegroundColor Red
}
