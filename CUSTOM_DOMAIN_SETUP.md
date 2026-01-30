# Custom Domain Setup Guide

## Current URL
Your current Vercel URL is:
`https://ai-agent-practice-o06ibj38n-peilins-projects-d5b74cca.vercel.app`

## Option 1: Use a Simpler Vercel URL (Easiest)

You can rename your project in Vercel to get a simpler URL:

1. Go to: https://vercel.com/dashboard
2. Click on your project: `ai-agent-practice`
3. Go to: **Settings** → **General**
4. Find: **Project Name**
5. Change it to: `chatgpt-clone` or `chat-clone` (shorter names)
6. Save

Your new URL will be:
- `https://chatgpt-clone.vercel.app` (much simpler!)

## Option 2: Add Custom Domain `chatclonepractice.ai-builder.space`

### Step 1: Get the Domain

You'll need to own or have access to `ai-builder.space` domain. If you don't have it:
- Purchase it from a domain registrar (Namecheap, GoDaddy, etc.)
- Or use a subdomain if you have access to `ai-builder.space`

### Step 2: Add Domain in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to: **Settings** → **Domains**
4. Click: **Add Domain**
5. Enter: `chatclonepractice.ai-builder.space`
6. Click: **Add**

### Step 3: Configure DNS

Vercel will show you DNS records to add. You'll need to add these to your domain's DNS settings:

**If using a subdomain (chatclonepractice.ai-builder.space):**

Add a CNAME record:
- **Type**: CNAME
- **Name**: `chatclonepractice`
- **Value**: `cname.vercel-dns.com`
- **TTL**: 3600 (or default)

**If using root domain (ai-builder.space):**

Add an A record:
- **Type**: A
- **Name**: `@` (or root)
- **Value**: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
- **TTL**: 3600

### Step 4: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Vercel will automatically detect when DNS is configured
- You'll see "Valid Configuration" in Vercel dashboard

### Step 5: SSL Certificate

Vercel automatically provisions SSL certificates (HTTPS) for custom domains.

## Option 3: Use Vercel's Free Domain Options

Vercel offers some free domain options, but they're limited. The simplest is Option 1 (rename project).

## Quick Steps Summary

**For simpler Vercel URL:**
1. Dashboard → Project → Settings → General
2. Change Project Name to `chatgpt-clone`
3. New URL: `https://chatgpt-clone.vercel.app`

**For custom domain:**
1. Dashboard → Project → Settings → Domains
2. Add `chatclonepractice.ai-builder.space`
3. Configure DNS records as shown by Vercel
4. Wait for DNS propagation

## Recommended: Rename Project

The easiest solution is to rename your project in Vercel:
- Current: `ai-agent-practice`
- New: `chatgpt-clone` or `chat-clone`
- New URL: `https://chatgpt-clone.vercel.app`

This takes 30 seconds and requires no DNS configuration!
