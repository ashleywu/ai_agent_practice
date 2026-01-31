# Setup script for new GitHub repository: ahacatcher
# This script initializes a new git repository and pushes to github.com/ashleywu/ahacatcher

Write-Host "=== Setting up new repository: ahacatcher ===" -ForegroundColor Cyan

$NEW_REPO_URL = "https://github.com/ashleywu/ahacatcher.git"
$CURRENT_DIR = Get-Location

# Check if we're in the right directory
if (-not (Test-Path "app.py")) {
    Write-Host "ERROR: app.py not found. Please run this script from phaseBp1 directory." -ForegroundColor Red
    exit 1
}

# Check if .git already exists
if (Test-Path ".git") {
    Write-Host "WARNING: .git directory already exists in this directory." -ForegroundColor Yellow
    Write-Host "This will create a new repository. Existing git history will be preserved." -ForegroundColor Yellow
    $response = Read-Host "Continue? (y/n)"
    if ($response -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
    
    # Check current remote
    $currentRemote = git remote get-url origin 2>$null
    if ($currentRemote) {
        Write-Host "Current remote: $currentRemote" -ForegroundColor Yellow
        Write-Host "We'll add the new repository as 'new-origin' and you can switch later." -ForegroundColor Yellow
    }
} else {
    # Check if parent directory has git (we're in a subdirectory)
    $currentPath = Get-Location
    if ($currentPath) {
        $parentPath = Split-Path $currentPath -Parent
        if ($parentPath) {
            $parentGit = Join-Path $parentPath ".git"
            if (Test-Path $parentGit) {
                Write-Host "NOTE: Parent directory has a git repository." -ForegroundColor Cyan
                Write-Host "We'll initialize a new git repository in this directory." -ForegroundColor Cyan
                Write-Host "This will create a separate repository for Aha! Catcher." -ForegroundColor Cyan
            }
        }
    }
}

# Step 1: Initialize git repository (if not already initialized)
if (-not (Test-Path ".git")) {
    Write-Host "`n[1/6] Initializing git repository..." -ForegroundColor Green
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[1/5] Git repository already initialized" -ForegroundColor Green
}

# Step 2: Add all files
Write-Host "`n[2/5] Adding files to git..." -ForegroundColor Green
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add files" -ForegroundColor Red
    exit 1
}

# Step 3: Create initial commit (if needed)
$hasCommits = git rev-parse --verify HEAD 2>$null
if (-not $hasCommits) {
    Write-Host "`n[3/6] Creating initial commit..." -ForegroundColor Green
    git commit -m "Initial commit: Aha! Catcher - Voice-powered idea capture app"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create commit" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[3/6] Repository already has commits" -ForegroundColor Green
}

# Step 4: Update Dockerfile for new repository (files in root)
Write-Host "`n[4/6] Updating Dockerfile for new repository structure..." -ForegroundColor Green
if (Test-Path "Dockerfile.new_repo") {
    Copy-Item "Dockerfile.new_repo" "Dockerfile" -Force
    git add Dockerfile
    Write-Host "Dockerfile updated for root directory structure" -ForegroundColor Green
} else {
    Write-Host "NOTE: Dockerfile.new_repo not found. Dockerfile may need manual update." -ForegroundColor Yellow
}

# Step 5: Add remote repository
Write-Host "`n[5/6] Adding remote repository..." -ForegroundColor Green
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -and $currentRemote -ne $NEW_REPO_URL) {
    Write-Host "Current origin points to: $currentRemote" -ForegroundColor Yellow
    Write-Host "Adding new repository as 'new-origin'..." -ForegroundColor Yellow
    git remote add new-origin $NEW_REPO_URL
    Write-Host "To switch to the new repository, run:" -ForegroundColor Cyan
    Write-Host "  git remote remove origin" -ForegroundColor Cyan
    Write-Host "  git remote rename new-origin origin" -ForegroundColor Cyan
} else {
    git remote remove origin 2>$null
    git remote add origin $NEW_REPO_URL
    Write-Host "Remote 'origin' set to: $NEW_REPO_URL" -ForegroundColor Green
}

# Step 5: Push to new repository
Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Green
Write-Host "Repository URL: $NEW_REPO_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure you've created the repository on GitHub first!" -ForegroundColor Yellow
Write-Host "Visit: https://github.com/new" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($response -ne "y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    exit 0
}

# Determine which remote to use
$remoteToUse = if (git remote get-url new-origin 2>$null) { "new-origin" } else { "origin" }

Write-Host "Pushing to $remoteToUse..." -ForegroundColor Green
git push -u $remoteToUse main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "If push failed, try:" -ForegroundColor Yellow
    Write-Host "  git push -u $remoteToUse main --force" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or if the branch is named differently:" -ForegroundColor Yellow
    $currentBranch = git branch --show-current
    Write-Host "  git push -u $remoteToUse $currentBranch" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "=== Success! ===" -ForegroundColor Green
    Write-Host "Repository URL: $NEW_REPO_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update deploy.py to use the new repository URL" -ForegroundColor White
    Write-Host "2. Run deployment: python deploy.py --repo-url $NEW_REPO_URL --service-name pw-aha-catcher" -ForegroundColor White
}
