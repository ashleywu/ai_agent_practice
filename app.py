"""
FastAPI application for Aha! Catcher
Serves static files and proxies API requests to avoid CORS issues
"""

from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import urllib.request
import urllib.parse
import json
from pathlib import Path
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aha! Catcher", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API credentials from environment variables
API_BASE_URL = os.getenv('AI_BUILDER_BASE_URL', 'https://space.ai-builders.com/backend')
API_KEY = os.getenv('AI_BUILDER_API_KEY', '')

if not API_KEY:
    logger.warning("AI_BUILDER_API_KEY not found in environment variables!")

logger.info(f"API Base URL: {API_BASE_URL}")
logger.info(f"API Key present: {bool(API_KEY)}")

# Serve static files
static_dir = Path(__file__).parent
if (static_dir / "index.html").exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def read_root():
    """Serve the main HTML file"""
    html_path = static_dir / "index.html"
    if html_path.exists():
        return FileResponse(html_path)
    return {"message": "Aha! Catcher API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api_base_url": API_BASE_URL,
        "api_key_configured": bool(API_KEY)
    }


@app.post("/api/v1/audio/transcriptions")
async def proxy_transcriptions(
    request: Request,
    audio_file: Optional[UploadFile] = File(None),
    audio_url: Optional[str] = Form(None),
    language: Optional[str] = Form(None)
):
    """Proxy audio transcription requests to the AI Builder API"""
    api_url = f"{API_BASE_URL}/v1/audio/transcriptions"
    
    logger.info(f"Proxying transcription request to: {api_url}")
    logger.info(f"Audio file: {audio_file.filename if audio_file else 'None'}")
    logger.info(f"Language: {language}")
    
    try:
        # Use requests library for better multipart handling
        import requests
        
        # Prepare form data
        files = {}
        data = {}
        
        if audio_file:
            # Read the uploaded file
            file_content = await audio_file.read()
            files['audio_file'] = (audio_file.filename, file_content, audio_file.content_type)
            logger.info(f"Audio file size: {len(file_content)} bytes")
        
        if audio_url:
            data['audio_url'] = audio_url
        
        if language:
            data['language'] = language
        
        # Make request to API using requests library
        headers = {
            'Authorization': f'Bearer {API_KEY}'
        }
        
        response = requests.post(api_url, files=files, data=data, headers=headers, timeout=60)
        
        logger.info(f"API Response: {response.status_code}")
        
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code
        )
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": f"Request failed: {str(e)}"},
            status_code=500
        )
    except Exception as e:
        logger.error(f"Error proxying request: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )


@app.post("/api/v1/chat/completions")
async def proxy_chat_completions(request: Request):
    """Proxy chat completion requests to the AI Builder API"""
    api_url = f"{API_BASE_URL}/v1/chat/completions"
    
    try:
        body = await request.body()
        request_data = json.loads(body.decode('utf-8'))
        
        logger.info(f"Proxying chat completion request to: {api_url}")
        logger.info(f"Model: {request_data.get('model', 'unknown')}")
        
        # Use requests library for better error handling
        import requests
        
        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(api_url, data=body, headers=headers, timeout=60)
        
        logger.info(f"API Response: {response.status_code}")
        
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code
        )
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": f"Request failed: {str(e)}"},
            status_code=500
        )
    except Exception as e:
        logger.error(f"Error proxying request: {str(e)}", exc_info=True)
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )


if __name__ == "__main__":
    import uvicorn
    # Default to 8080 for local development, PORT env var for deployment
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
