# Vercel Environment Variables Setup

## ⚠️ Current Issue
Your deployment is missing environment variables, causing the error:
`AI_BUILDER_API_KEY is not configured`

## ✅ Quick Fix - Add Environment Variables

### Step 1: Go to Vercel Dashboard

1. **Open**: https://vercel.com/dashboard
2. **Click** on your project: `ai-agent-practice` (or `practicechat` if renamed)

### Step 2: Add Environment Variables

1. **Go to**: **Settings** → **Environment Variables**
2. **Click**: **Add New**

3. **Add First Variable**:
   - **Name**: `AI_BUILDER_API_KEY`
   - **Value**: `sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae`
   - **Environment**: Select all (Production, Preview, Development)
   - **Click**: **Save**

4. **Add Second Variable**:
   - **Name**: `AI_BUILDER_BASE_URL`
   - **Value**: `https://space.ai-builders.com/backend`
   - **Environment**: Select all (Production, Preview, Development)
   - **Click**: **Save**

### Step 3: Redeploy

After adding environment variables:

1. **Go to**: **Deployments** tab
2. **Click**: **"..."** menu on latest deployment
3. **Select**: **Redeploy**
4. **Or**: Click the **"Redeploy"** button

### Step 4: Verify

After redeployment:
- Wait for build to complete (1-2 minutes)
- Open your deployment URL
- Test sending a message
- Should work now! ✅

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `AI_BUILDER_API_KEY` = `sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae`
- [ ] `AI_BUILDER_BASE_URL` = `https://space.ai-builders.com/backend`

## 🔒 Security Note

- Environment variables are encrypted in Vercel
- They're only accessible to your project
- Never commit `.env` files to git (already in `.gitignore`)

## 🎯 Quick Steps Summary

1. Dashboard → Project → Settings → Environment Variables
2. Add `AI_BUILDER_API_KEY` = your key
3. Add `AI_BUILDER_BASE_URL` = `https://space.ai-builders.com/backend`
4. Redeploy
5. Test!
