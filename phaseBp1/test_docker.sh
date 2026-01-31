#!/bin/bash
# Test script for Docker deployment

echo "=== Testing Docker Build ==="
docker build -t aha-catcher:test .

echo ""
echo "=== Testing Docker Run ==="
docker run -d \
  --name aha-catcher-test \
  -p 8000:8000 \
  -e AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend \
  -e AI_BUILDER_API_KEY=sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae \
  aha-catcher:test

echo ""
echo "Waiting for container to start..."
sleep 5

echo ""
echo "=== Testing Health Endpoint ==="
curl http://localhost:8000/health

echo ""
echo ""
echo "=== Testing Root Endpoint ==="
curl -I http://localhost:8000/

echo ""
echo ""
echo "=== Container Status ==="
docker ps | grep aha-catcher-test

echo ""
echo ""
echo "=== To stop and remove container ==="
echo "docker stop aha-catcher-test && docker rm aha-catcher-test"
