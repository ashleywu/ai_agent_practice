#!/usr/bin/env python3
"""
Test script to verify API connectivity and transcription endpoint
"""

import urllib.request
import urllib.parse
from pathlib import Path
import json

def load_env():
    env_path = Path(__file__).parent / '.env'
    env_vars = {}
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

ENV = load_env()
API_BASE_URL = ENV.get('AI_BUILDER_BASE_URL', 'https://space.ai-builders.com/backend')
API_KEY = ENV.get('AI_BUILDER_API_KEY', '')

print(f"API Base URL: {API_BASE_URL}")
print(f"API Key: {API_KEY[:20]}...{API_KEY[-10:] if API_KEY else 'NOT FOUND'}")

# Test 1: Check if API is accessible
print("\n=== Test 1: Health Check ===")
try:
    health_url = f"{API_BASE_URL}/health"
    print(f"Testing: {health_url}")
    req = urllib.request.Request(health_url)
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Check transcription endpoint (without file - should get validation error)
print("\n=== Test 2: Transcription Endpoint (should fail with validation error) ===")
try:
    transcribe_url = f"{API_BASE_URL}/v1/audio/transcriptions"
    print(f"Testing: {transcribe_url}")
    
    # Create empty form data
    form_data = urllib.parse.urlencode({}).encode('utf-8')
    
    req = urllib.request.Request(transcribe_url, data=form_data)
    req.add_header('Authorization', f'Bearer {API_KEY}')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}:")
    try:
        error_body = e.read().decode('utf-8')
        print(f"Response: {error_body}")
        # Try to parse as JSON
        try:
            error_json = json.loads(error_body)
            print(f"Parsed JSON: {json.dumps(error_json, indent=2)}")
        except:
            pass
    except Exception as read_error:
        print(f"Could not read error body: {read_error}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Tests Complete ===")
