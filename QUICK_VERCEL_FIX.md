# Quick Fix - Add Environment Variables to Vercel

## ⚡ Fastest Method (2 minutes)

### Step 1: Open Vercel Dashboard
**Go to**: https://vercel.com/dashboard

### Step 2: Navigate to Environment Variables
1. Click your project
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left sidebar)

### Step 3: Add Variables (Copy & Paste)

**Variable 1:**
- Click **"Add New"**
- **Name**: `AI_BUILDER_API_KEY`
- **Value**: `sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae`
- **Environments**: ✅ Production ✅ Preview ✅ Development (check all)
- Click **Save**

**Variable 2:**
- Click **"Add New"** again
- **Name**: `AI_BUILDER_BASE_URL`
- **Value**: `https://space.ai-builders.com/backend`
- **Environments**: ✅ Production ✅ Preview ✅ Development (check all)
- Click **Save**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

### Step 5: Test
Open your deployment URL and test the chat!

## 🎯 That's It!

Your chat should work now. The error was just missing environment variables.

## 📝 Visual Guide

```
Vercel Dashboard
  └─ Your Project
      └─ Settings
          └─ Environment Variables
              ├─ Add: AI_BUILDER_API_KEY = sk_a0e0e71f_...
              └─ Add: AI_BUILDER_BASE_URL = https://space.ai-builders.com/backend
```

## ⏱️ Total Time: ~2 minutes
