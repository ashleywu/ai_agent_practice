# Aha! Catcher - Web MVP

A simple web-based MVP for capturing "Aha!" moments with automatic transcription and research summary.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run locally**:
   ```bash
   python run_local.py
   ```

3. **Access**: http://localhost:8080

### Deploy to AI Builder Platform

1. **Push to GitHub** (public repository):
   ```bash
   git init
   git add .
   git commit -m "Aha! Catcher"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy**:
   ```bash
   python deploy.py --repo-url https://github.com/YOUR_USERNAME/YOUR_REPO
   ```

3. **Access**: `https://pw_aha-catcher.ai-builders.space`

## 📁 Project Structure

```
phaseBp1/
├── app.py                  # FastAPI backend
├── index.html              # Frontend web app
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
├── deploy.py               # Deployment script (AI Builder Platform)
├── run_local.py            # Local development server
├── test_deploy.py          # Deployment readiness check
├── .env                    # Environment variables (not committed)
└── .gitignore              # Git ignore file
```

## 🔧 Configuration

Environment variables (set in `.env` or deployment):
- `AI_BUILDER_API_KEY` - Your API key (required)
- `AI_BUILDER_BASE_URL` - API base URL (default: https://space.ai-builders.com/backend)
- `PORT` - Server port (default: 8000)

## 📚 Documentation

- **QUICK_DEPLOY.md** - Fastest deployment guide
- **DEPLOY_USING_API.md** - Detailed API deployment guide
- **DEPLOYMENT_SUMMARY.md** - Complete deployment overview
- **README_DEPLOY.md** - Docker deployment guide

## ✅ Features

- ✅ Continuous 30-second audio buffer
- ✅ One-click capture
- ✅ Automatic transcription
- ✅ AI-powered research summary
- ✅ FastAPI backend with CORS support
- ✅ Docker support
- ✅ Platform API deployment ready

## 🧪 Testing

### Test Deployment Readiness
```bash
python test_deploy.py
```

### Test Docker Build
```bash
docker build -t aha-catcher .
docker run -p 8000:8000 \
  -e AI_BUILDER_API_KEY=your_key \
  -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend \
  aha-catcher
```

## 📖 API Usage

The app uses the AI Builder Platform API:
- **Transcription**: `/v1/audio/transcriptions`
- **Chat Completions**: `/v1/chat/completions` (for research summary)

See: https://space.ai-builders.com/backend/openapi.json

## 🎯 Deployment Status

✅ **Ready for deployment!**

All requirements met:
- ✅ Single process/single port
- ✅ PORT environment variable support
- ✅ Public repository ready
- ✅ No secrets in code
- ✅ Lightweight (meets 256MB RAM limit)
