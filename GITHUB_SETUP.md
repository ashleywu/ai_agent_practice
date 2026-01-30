# GitHub Repository Setup Guide

## Step 1: Configure Git (if not already done)

Run these commands to set your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or for this repository only:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create GitHub Repository

### Option A: Using GitHub Website (Easiest)

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `AI_agent_practice`
4. Description: "ChatGPT clone with Next.js and multiple AI models"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create AI_agent_practice --public --source=. --remote=origin --push
```

## Step 3: Commit Your Code

After configuring Git, run:

```bash
git add .
git commit -m "Initial commit: ChatGPT clone with Next.js"
```

## Step 4: Connect to GitHub and Push

After creating the repository on GitHub, run:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/AI_agent_practice.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Set Up GitHub Secrets (for deployment)

If you want to deploy from GitHub:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `AI_BUILDER_API_KEY` - Your API key
   - `AI_BUILDER_BASE_URL` - `https://space.ai-builders.com/backend`

## Quick Commands Summary

```bash
# 1. Configure Git (one-time)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Commit your code
git add .
git commit -m "Initial commit: ChatGPT clone with Next.js"

# 3. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/AI_agent_practice.git

# 4. Push to GitHub
git branch -M main
git push -u origin main
```

## Troubleshooting

### If you get "repository already exists" error:
- The repository name might be taken
- Try a different name or add your username prefix

### If push is rejected:
- Make sure you've created the repository on GitHub first
- Check that the remote URL is correct
- You may need to authenticate (GitHub will prompt you)

### Authentication:
- GitHub may ask for authentication
- Use a Personal Access Token (PAT) instead of password
- Create one at: GitHub → Settings → Developer settings → Personal access tokens
