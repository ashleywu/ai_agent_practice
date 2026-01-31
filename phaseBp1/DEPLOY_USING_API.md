# Deploy Using AI Builder Platform API

This guide shows how to deploy Aha! Catcher using the AI Builder Platform deployment API.

## Prerequisites

1. **Public Git Repository**: Your code must be in a public GitHub repository
2. **API Key**: Your `AI_BUILDER_API_KEY` from `.env` file
3. **Python**: To run the deployment script

## Quick Deploy

### Step 1: Push Your Code to GitHub

Make sure your code is in a public GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit: Aha! Catcher"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Deploy Using the Script

```bash
python deploy.py --repo-url https://github.com/yourusername/your-repo --service-name pw_aha-catcher
```

The script will:
- ✅ Queue the deployment
- ✅ Show build logs
- ✅ Poll for deployment status
- ✅ Display the public URL when ready

### Step 3: Access Your App

Once deployment is complete, you'll get a URL like:
```
https://pw_aha-catcher.ai-builders.space
```

## Manual Deployment (Using curl)

If you prefer to deploy manually:

```bash
curl -X POST https://space.ai-builders.com/backend/v1/deployments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/yourusername/your-repo",
    "service_name": "pw_aha-catcher",
    "branch": "main",
    "port": 8000,
    "env_vars": {
      "AI_BUILDER_BASE_URL": "https://space.ai-builders.com/backend",
      "AI_BUILDER_API_KEY": "your_api_key_here"
    }
  }'
```

## Check Deployment Status

### Using the Script

```bash
python deploy.py --list
```

### Using curl

```bash
curl https://space.ai-builders.com/backend/v1/deployments/aha-catcher \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Deployment Requirements

According to the [OpenAPI specification](https://space.ai-builders.com/backend/openapi.json), your application must:

1. ✅ **Single process/single port**: Serve API and static files from one server
2. ✅ **Honor PORT environment variable**: Use `os.getenv("PORT", 8000)`
3. ✅ **Public repository**: No private repos or secrets in code
4. ✅ **Resource limit**: 256 MB RAM (nano containers)

Our `app.py` already meets these requirements! ✅

## Environment Variables

The platform will inject:
- `AI_BUILDER_TOKEN` - Automatically injected (your API key)
- Custom `env_vars` from deployment request

Our app uses:
- `AI_BUILDER_BASE_URL` - API base URL
- `AI_BUILDER_API_KEY` - Your API key (passed via env_vars)

## Deployment Status

Status values:
- `queued` - Waiting to start
- `deploying` - Building and deploying
- `HEALTHY` - ✅ Running successfully
- `UNHEALTHY` - ❌ Service not responding
- `DEGRADED` - ⚠️ Service has issues
- `ERROR` - 💥 Deployment failed
- `SLEEPING` - 😴 Service inactive

## Troubleshooting

### Deployment Fails

1. **Check build logs**: The deployment response includes `streaming_logs`
2. **Verify repository**: Must be public and accessible
3. **Check requirements.txt**: All dependencies must be installable
4. **Verify PORT**: App must use `PORT` environment variable

### Service Not Healthy

1. **Check runtime logs**:
   ```bash
   curl https://space.ai-builders.com/backend/v1/deployments/aha-catcher/logs?log_type=runtime \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. **Verify health endpoint**: App should respond to `/health`

3. **Check environment variables**: Ensure API keys are set correctly

## Example: Complete Deployment Flow

```bash
# 1. Ensure code is committed and pushed
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy
python deploy.py \
  --repo-url https://github.com/yourusername/your-repo \
  --service-name pw_aha-catcher \
  --branch main

# 3. Wait for deployment (script will poll automatically)
# Output will show:
# ✅ Deployment queued successfully!
# ⏳ Waiting for deployment to complete...
# ✅ Deployment finished with status: HEALTHY
# 🌐 Your app is available at: https://pw_aha-catcher.ai-builders.space

# 4. Test your app
curl https://pw_aha-catcher.ai-builders.space/health
```

## Notes

- **Free hosting**: 12 months from first successful deployment
- **Service limit**: Maximum 2 services per user (default)
- **Deployment time**: Typically 5-10 minutes
- **Automatic API key**: `AI_BUILDER_TOKEN` is injected automatically

## Files for Deployment

Make sure these files are in your repository:
- ✅ `app.py` - FastAPI application
- ✅ `index.html` - Frontend
- ✅ `requirements.txt` - Python dependencies
- ✅ `Dockerfile` - Docker configuration (optional, platform may auto-detect)

The platform will automatically:
- Detect Python/FastAPI applications
- Install dependencies from `requirements.txt`
- Run the application using uvicorn
- Expose it at `https://<service-name>.ai-builders.space`
