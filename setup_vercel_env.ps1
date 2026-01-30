# Script to set Vercel environment variables via CLI

Write-Host "=== Setting Vercel Environment Variables ===" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is available
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = npx vercel@latest --version 2>&1
    Write-Host "✓ Vercel CLI available" -ForegroundColor Green
} catch {
    Write-Host "⚠ Vercel CLI not available via npx" -ForegroundColor Yellow
    Write-Host "You'll need to set environment variables manually in Vercel dashboard" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host ""

# Set AI_BUILDER_API_KEY
Write-Host "Setting AI_BUILDER_API_KEY..." -ForegroundColor Gray
npx vercel@latest env add AI_BUILDER_API_KEY production <<< "sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae" 2>&1
npx vercel@latest env add AI_BUILDER_API_KEY preview <<< "sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae" 2>&1
npx vercel@latest env add AI_BUILDER_API_KEY development <<< "sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae" 2>&1

# Set AI_BUILDER_BASE_URL
Write-Host "Setting AI_BUILDER_BASE_URL..." -ForegroundColor Gray
npx vercel@latest env add AI_BUILDER_BASE_URL production <<< "https://space.ai-builders.com/backend" 2>&1
npx vercel@latest env add AI_BUILDER_BASE_URL preview <<< "https://space.ai-builders.com/backend" 2>&1
npx vercel@latest env add AI_BUILDER_BASE_URL development <<< "https://space.ai-builders.com/backend" 2>&1

Write-Host ""
Write-Host "✓ Environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Redeploy your project" -ForegroundColor Yellow
Write-Host "Run: npx vercel@latest --prod" -ForegroundColor Cyan
Write-Host "Or redeploy from Vercel dashboard" -ForegroundColor Cyan
