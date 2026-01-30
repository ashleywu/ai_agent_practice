# Deploy to Vercel - Quick Guide

## Method 1: Using PowerShell Script (Easiest)

Run this in your terminal:

```powershell
cd c:\Users\peili\fastapi_hello
.\deploy_vercel.ps1
```

This will:
- Use npx (no installation needed)
- Open browser for authentication
- Guide you through deployment
- Give you a production URL

## Method 2: Manual Deployment via Website (Recommended if script doesn't work)

### Step 1: Push to GitHub (if not done)

```powershell
cd c:\Users\peili\fastapi_hello
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Deploy on Vercel Website

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New..." → "Project"
4. **Import**: Your `AI_agent_practice` repository
5. **Configure**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - Name: `AI_BUILDER_API_KEY`
     - Value: `sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae`
   - Add:
     - Name: `AI_BUILDER_BASE_URL`
     - Value: `https://space.ai-builders.com/backend`
7. **Click**: "Deploy"

### Step 3: Wait for Deployment

Vercel will:
- Install dependencies
- Build your app
- Deploy it
- Give you a URL like: `https://ai-agent-practice.vercel.app`

## Method 3: Using npx directly

```powershell
cd c:\Users\peili\fastapi_hello

# Deploy
npx vercel@latest

# Follow prompts, then set environment variables in dashboard
# Then deploy to production:
npx vercel --prod
```

## After Deployment

1. **Get your URL**: Vercel will show it in the terminal/dashboard
2. **Test**: Open the URL in your browser
3. **Set Environment Variables**: If not set during deployment
   - Dashboard → Project → Settings → Environment Variables
4. **Redeploy**: After adding env vars, redeploy from dashboard

## Your Deployment URL

After deployment, you'll get a URL like:
- `https://ai-agent-practice-xxxxx.vercel.app`
- Or a custom domain if you set one up

## Quick Commands

```powershell
# Deploy (first time)
npx vercel@latest

# Deploy to production
npx vercel --prod

# View deployments
npx vercel ls

# View logs
npx vercel logs
```
