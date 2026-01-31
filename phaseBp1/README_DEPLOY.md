# Aha! Catcher - Deployment Instructions

## ✅ Files Created for Deployment

1. **app.py** - FastAPI application that serves static files and proxies API requests
2. **Dockerfile** - Docker image definition
3. **docker-compose.yml** - Docker Compose configuration
4. **requirements.txt** - Python dependencies
5. **.dockerignore** - Files to exclude from Docker build
6. **test_docker.ps1** / **test_docker.sh** - Docker testing scripts

## 🚀 Quick Deployment Steps

### Option 1: Test Locally First

1. **Start Docker Desktop** (if on Windows/Mac)

2. **Build the Docker image**:
   ```bash
   docker build -t aha-catcher .
   ```

3. **Run the container**:
   ```bash
   docker run -d \
     --name aha-catcher \
     -p 8000:8000 \
     -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend \
     -e AI_BUILDER_API_KEY=sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae \
     aha-catcher
   ```

4. **Test the application**:
   - Open http://localhost:8080
   - Check health: http://localhost:8080/health

5. **View logs**:
   ```bash
   docker logs aha-catcher
   ```

6. **Stop and remove**:
   ```bash
   docker stop aha-catcher
   docker rm aha-catcher
   ```

### Option 2: Using Docker Compose

1. **Create a `.env` file** (or export environment variables):
   ```bash
   AI_BUILDER_API_KEY=sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae
   AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend
   ```

2. **Start the service**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop the service**:
   ```bash
   docker-compose down
   ```

### Option 3: Deploy to AI Builder Platform

Based on the OpenAPI spec, you can deploy using the deployment API:

1. **Ensure your code is in a public Git repository**

2. **Deploy via API**:
   ```bash
   curl -X POST https://space.ai-builders.com/backend/v1/deployments \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "repo_url": "https://github.com/yourusername/your-repo",
       "service_name": "aha-catcher",
       "branch": "main",
       "port": 8000,
       "env_vars": {
         "AI_BUILDER_BASE_URL": "https://space.ai-builders.com/backend",
         "AI_BUILDER_API_KEY": "your_api_key_here"
       }
     }'
   ```

3. **Check deployment status**:
   ```bash
   curl https://space.ai-builders.com/backend/v1/deployments/aha-catcher \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## 🧪 Testing

### Test Docker Build (Windows PowerShell)
```powershell
.\test_docker.ps1
```

### Test Docker Build (Linux/Mac)
```bash
chmod +x test_docker.sh
./test_docker.sh
```

### Manual Testing

1. **Test health endpoint**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **Test root endpoint**:
   ```bash
   curl http://localhost:8000/
   ```

3. **Test in browser**:
   - Open http://localhost:8080
   - Grant microphone permissions
   - Test recording and transcription

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `AI_BUILDER_BASE_URL` | API base URL | `https://space.ai-builders.com/backend` |
| `AI_BUILDER_API_KEY` | API key (required) | - |

## 🔍 Troubleshooting

### Docker Build Fails
- Ensure Docker Desktop is running
- Check Dockerfile syntax
- Verify all files exist (app.py, requirements.txt, index.html)

### Container Won't Start
- Check logs: `docker logs aha-catcher`
- Verify environment variables
- Ensure port 8000 is available

### API Requests Fail
- Verify `AI_BUILDER_API_KEY` is correct
- Check `AI_BUILDER_BASE_URL` is correct
- View container logs for detailed errors

### CORS Errors
- The FastAPI app includes CORS middleware
- Frontend uses relative `/api` paths when deployed
- Check browser console for specific errors

## 📁 Project Structure

```
phaseBp1/
├── app.py              # FastAPI backend
├── index.html          # Frontend web app
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker image
├── docker-compose.yml # Docker Compose config
├── .dockerignore      # Docker ignore file
├── .env               # Environment variables (not in Docker)
└── DEPLOYMENT.md      # Detailed deployment guide
```

## ✨ Key Features

- ✅ FastAPI backend with CORS support
- ✅ Static file serving
- ✅ API request proxying
- ✅ Environment variable configuration
- ✅ Health check endpoint
- ✅ Docker support
- ✅ Production-ready

## 🎯 Next Steps

1. Test locally with Docker
2. Push code to Git repository
3. Deploy using AI Builder Platform API
4. Monitor deployment status
5. Test deployed application
