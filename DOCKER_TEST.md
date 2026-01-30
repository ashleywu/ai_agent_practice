# Docker Testing Guide

## Prerequisites

### Install Docker Desktop for Windows

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer if prompted
3. Start Docker Desktop
4. Verify installation:
   ```powershell
   docker --version
   docker-compose --version
   ```

## Docker Files Created

- ✅ `Dockerfile` - Multi-stage Docker build configuration
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `docker-compose.yml` - Docker Compose configuration for easy testing
- ✅ `next.config.js` - Updated with standalone output for Docker

## Testing Docker

### Option 1: Using Docker Compose (Recommended)

1. **Set environment variables**:
   Create a `.env` file in the project root (if not exists):
   ```env
   AI_BUILDER_API_KEY=your_api_key_here
   AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend
   ```

2. **Build and run**:
   ```powershell
   docker-compose up --build
   ```

3. **Access the application**:
   Open your browser to: http://localhost:3000

4. **Stop the container**:
   Press `Ctrl+C` or run:
   ```powershell
   docker-compose down
   ```

### Option 2: Using Docker Commands Directly

1. **Build the image**:
   ```powershell
   docker build -t chatgpt-clone .
   ```

2. **Run the container**:
   ```powershell
   docker run -p 3000:3000 `
     -e AI_BUILDER_API_KEY=your_api_key_here `
     -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend `
     chatgpt-clone
   ```

3. **Access the application**:
   Open your browser to: http://localhost:3000

4. **Stop the container**:
   Find the container ID:
   ```powershell
   docker ps
   ```
   Stop it:
   ```powershell
   docker stop <container_id>
   ```

### Option 3: Run in Background (Detached Mode)

```powershell
docker-compose up -d --build
```

View logs:
```powershell
docker-compose logs -f
```

Stop:
```powershell
docker-compose down
```

## Testing Commands

### Check if container is running:
```powershell
docker ps
```

### View container logs:
```powershell
docker-compose logs
# or for a specific container
docker logs <container_id>
```

### Execute commands in container:
```powershell
docker-compose exec chatgpt-clone sh
```

### Remove all containers and images:
```powershell
docker-compose down --rmi all
```

## Troubleshooting

### Build fails with "npm ci" error:
- Make sure `package-lock.json` exists
- Try: `npm install` locally first to generate lock file

### Port 3000 already in use:
- Stop any running Next.js dev server
- Or change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Use port 3001 instead
  ```

### Environment variables not working:
- Make sure `.env` file exists in project root
- Check variables are set correctly in `docker-compose.yml`
- Restart containers after changing environment variables

### Container exits immediately:
- Check logs: `docker-compose logs`
- Verify build completed successfully
- Check that `server.js` exists in `.next/standalone/`

## Production Deployment

For production deployment, consider:
- Using environment variable secrets management
- Setting up proper health checks
- Configuring resource limits
- Using a reverse proxy (nginx)
- Setting up SSL/TLS certificates

## Next Steps

After testing locally:
1. Push Docker image to a registry (Docker Hub, GitHub Container Registry)
2. Deploy to cloud platforms (AWS ECS, Google Cloud Run, Azure Container Instances)
3. Set up CI/CD pipelines for automated builds
