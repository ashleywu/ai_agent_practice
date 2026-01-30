# PowerShell script to push to GitHub
# Run this AFTER creating the repository on GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

Write-Host "Setting up GitHub remote..." -ForegroundColor Green

# Add remote repository
git remote add origin "https://github.com/$GitHubUsername/AI_agent_practice.git"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote added successfully!" -ForegroundColor Green
} else {
    Write-Host "Remote might already exist. Continuing..." -ForegroundColor Yellow
    git remote set-url origin "https://github.com/$GitHubUsername/AI_agent_practice.git"
}

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/AI_agent_practice" -ForegroundColor Cyan
} else {
    Write-Host "`nPush failed. You may need to:" -ForegroundColor Red
    Write-Host "1. Create the repository on GitHub first" -ForegroundColor Yellow
    Write-Host "2. Authenticate with GitHub (use Personal Access Token)" -ForegroundColor Yellow
    Write-Host "3. Make sure the repository name is 'AI_agent_practice'" -ForegroundColor Yellow
}
