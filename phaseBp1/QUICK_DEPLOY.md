# Quick Deploy Guide - Using AI Builder Platform API

## 🚀 Fastest Way to Deploy

### Prerequisites
- ✅ Code pushed to a **public** GitHub repository
- ✅ `.env` file with your `AI_BUILDER_API_KEY`

### Deploy in 3 Steps

#### 1. Push to GitHub (if not already done)
```bash
git init
git add .
git commit -m "Aha! Catcher - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2. Deploy Using Script
```bash
python deploy.py --repo-url https://github.com/YOUR_USERNAME/YOUR_REPO --service-name pw-aha-catcher
```

#### 3. Wait & Access
The script will:
- Queue your deployment
- Show build progress
- Poll until deployment completes
- Display your public URL: `https://pw_aha-catcher.ai-builders.space`

## 📋 What Gets Deployed

The platform automatically:
- ✅ Detects FastAPI application
- ✅ Installs dependencies from `requirements.txt`
- ✅ Runs `app.py` using uvicorn
- ✅ Injects `AI_BUILDER_TOKEN` environment variable
- ✅ Exposes at `https://<service-name>.ai-builders.space`

## 🔍 Check Status

```bash
# List all deployments
python deploy.py --list

# Or check specific deployment
curl https://space.ai-builders.com/backend/v1/deployments/pw-aha-catcher \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## ✅ Pre-Deployment Checklist

- [ ] Code is in a **public** GitHub repository
- [ ] `app.py` exists and runs locally
- [ ] `requirements.txt` includes all dependencies
- [ ] `index.html` is in the repository
- [ ] `.env` file is **NOT** committed (in `.gitignore`)
- [ ] App uses `PORT` environment variable (✅ already done)
- [ ] Health endpoint `/health` works (✅ already implemented)

## 🎯 Your App Structure (Ready for Deployment)

```
phaseBp1/
├── app.py              ✅ FastAPI backend (single process, single port)
├── index.html          ✅ Frontend web app
├── requirements.txt    ✅ Python dependencies
├── Dockerfile          ✅ Docker config (optional)
├── deploy.py           ✅ Deployment script
└── .gitignore          ✅ Excludes .env and sensitive files
```

## 💡 Tips

1. **Service Name**: Must be unique, lowercase, 3-32 chars, alphanumeric + hyphens
2. **Branch**: Default is `main`, specify with `--branch`
3. **Port**: Default is 8000, app automatically uses `PORT` env var
4. **Deployment Time**: Usually 5-10 minutes
5. **Free Hosting**: 12 months from first deployment

## 🐛 Troubleshooting

### "Repository not found"
- Ensure repository is **public**
- Check repository URL is correct

### "Deployment failed"
- Check build logs in deployment response
- Verify `requirements.txt` is correct
- Ensure `app.py` can start without errors

### "Service UNHEALTHY"
- Check runtime logs: `/v1/deployments/{service}/logs`
- Verify `/health` endpoint responds
- Check environment variables are set correctly

## 📚 More Info

See `DEPLOY_USING_API.md` for detailed documentation.
