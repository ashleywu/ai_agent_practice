# Deployment Guide for Aha! Catcher

## Overview

This application can be deployed using Docker. It includes:
- FastAPI backend that proxies API requests
- Static file serving for the web interface
- Environment variable configuration

## Prerequisites

- Docker installed
- Docker Compose (optional, for easier deployment)
- API credentials (AI_BUILDER_API_KEY and AI_BUILDER_BASE_URL)

## Quick Start

### Using Docker Compose (Recommended)

1. **Set environment variables**:
   ```bash
   export AI_BUILDER_API_KEY=your_api_key_here
   export AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend
   ```

2. **Start the service**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open http://localhost:8000 in your browser

### Using Docker Directly

1. **Build the image**:
   ```bash
   docker build -t aha-catcher .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name aha-catcher \
     -p 8000:8000 \
     -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend \
     -e AI_BUILDER_API_KEY=your_api_key_here \
     aha-catcher
   ```

3. **Access the application**:
   Open http://localhost:8000 in your browser

## Testing Docker

### Windows (PowerShell)
```powershell
.\test_docker.ps1
```

### Linux/Mac
```bash
chmod +x test_docker.sh
./test_docker.sh
```

## Environment Variables

- `PORT`: Server port (default: 8000)
- `AI_BUILDER_BASE_URL`: Base URL for the AI Builder API (default: https://space.ai-builders.com/backend)
- `AI_BUILDER_API_KEY`: Your API key for the AI Builder API (required)

## Health Check

The application includes a health check endpoint:
```bash
curl http://localhost:8080/health
```

## Deployment to Production

### Using the AI Builder Platform

Based on the OpenAPI spec, you can deploy using the `/v1/deployments` endpoint:

1. **Prepare your repository**:
   - Ensure all files are committed
   - Make sure the repository is public (required by the platform)

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

### Manual Deployment

1. **Build and push to container registry**:
   ```bash
   docker build -t your-registry/aha-catcher:latest .
   docker push your-registry/aha-catcher:latest
   ```

2. **Deploy to your hosting platform** (Koyeb, Railway, Render, etc.)

## Troubleshooting

### Container won't start
- Check logs: `docker logs aha-catcher`
- Verify environment variables are set correctly
- Ensure port 8000 is available

### API requests failing
- Verify `AI_BUILDER_API_KEY` is set correctly
- Check `AI_BUILDER_BASE_URL` is correct
- Check container logs for detailed error messages

### CORS errors
- The FastAPI app includes CORS middleware
- If issues persist, check that the frontend is using `/api` paths (relative)

## File Structure

```
phaseBp1/
├── app.py              # FastAPI application
├── index.html          # Frontend web interface
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker Compose configuration
├── .dockerignore       # Files to exclude from Docker build
└── .env                # Environment variables (not included in Docker)
```

## Notes

- The `.env` file is not included in the Docker image for security
- API keys should be provided via environment variables at runtime
- The application respects the `PORT` environment variable for deployment platforms
