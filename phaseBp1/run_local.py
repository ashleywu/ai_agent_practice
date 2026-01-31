#!/usr/bin/env python3
"""
Run the FastAPI application locally for testing
"""

import os
import uvicorn
from pathlib import Path

# Load environment variables from .env file if it exists
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

if __name__ == "__main__":
    # Default to 8080 for local development (matches server.py)
    # PORT env var can override for deployment platforms
    port = int(os.getenv("PORT", 8080))
    print(f"Starting Aha! Catcher on http://localhost:{port}")
    print(f"API Base URL: {os.getenv('AI_BUILDER_BASE_URL', 'https://space.ai-builders.com/backend')}")
    print(f"API Key configured: {bool(os.getenv('AI_BUILDER_API_KEY'))}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
