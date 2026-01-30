# Deployment Guide

This guide will help you deploy your ChatGPT Clone to production.

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the easiest deployment experience.

### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

4. **Set Environment Variables**:
   After deployment, go to your Vercel dashboard:
   - Navigate to your project → Settings → Environment Variables
   - Add these variables:
     - `AI_BUILDER_API_KEY` = your API key
     - `AI_BUILDER_BASE_URL` = `https://space.ai-builders.com/backend`

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your Git repository (or drag & drop your project folder)
5. Add environment variables in project settings
6. Click "Deploy"

---

## Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

5. **Set Environment Variables** in Netlify dashboard:
   - Site settings → Environment variables
   - Add `AI_BUILDER_API_KEY` and `AI_BUILDER_BASE_URL`

---

## Option 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   - `AI_BUILDER_API_KEY`
   - `AI_BUILDER_BASE_URL`
6. Railway will automatically detect Next.js and deploy

---

## Option 4: Self-Hosted (VPS/Docker)

### Using Docker:

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:20-alpine AS base
   
   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Build
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Production
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js** for standalone output:
   ```js
   module.exports = {
     output: 'standalone',
   }
   ```

3. **Build and run**:
   ```bash
   docker build -t chatgpt-clone .
   docker run -p 3000:3000 -e AI_BUILDER_API_KEY=your_key -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend chatgpt-clone
   ```

---

## Environment Variables Required

Make sure to set these in your deployment platform:

- `AI_BUILDER_API_KEY` - Your AI Builders API key
- `AI_BUILDER_BASE_URL` - `https://space.ai-builders.com/backend` (optional, has default)

---

## Post-Deployment Checklist

- [ ] Environment variables are set
- [ ] Site is accessible
- [ ] Chat functionality works
- [ ] All models are selectable
- [ ] Markdown rendering works
- [ ] Conversations save properly (localStorage works in browser)

---

## Troubleshooting

### Build Errors
- Make sure all dependencies are in `package.json`
- Run `npm install` before deploying
- Check Node.js version (should be 18+)

### API Errors
- Verify environment variables are set correctly
- Check API key is valid
- Ensure API endpoint URL is correct

### Runtime Errors
- Check browser console for errors
- Verify all environment variables are set
- Check Vercel/Netlify function logs
