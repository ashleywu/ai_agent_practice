#!/usr/bin/env python3
"""
Test deployment script - Check API connectivity and deployment readiness
"""

import requests
import json
from pathlib import Path

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

def test_api_connection():
    """Test connection to AI Builder API"""
    print("[TEST] Testing API Connection...")
    
    # Test health endpoint
    try:
        health_url = f"{API_BASE_URL}/health"
        response = requests.get(health_url, timeout=10)
        print(f"   [OK] Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   [FAIL] Health check failed: {e}")
        return False
    
    # Test deployments endpoint (list)
    if API_KEY:
        try:
            deployments_url = f"{API_BASE_URL}/v1/deployments"
            headers = {"Authorization": f"Bearer {API_KEY}"}
            response = requests.get(deployments_url, headers=headers, timeout=10)
            print(f"   [OK] Deployments API: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Active deployments: {data.get('active_count', 0)}/{data.get('limit', 0)}")
        except Exception as e:
            print(f"   [FAIL] Deployments API failed: {e}")
            return False
    else:
        print("   [WARN] No API key found, skipping authenticated endpoints")
    
    return True

def check_files():
    """Check if all required files exist"""
    print("\n[CHECK] Checking Required Files...")
    
    required_files = [
        'app.py',
        'index.html',
        'requirements.txt',
        'Dockerfile',
        '.gitignore'
    ]
    
    all_exist = True
    for file in required_files:
        path = Path(file)
        if path.exists():
            print(f"   [OK] {file}")
        else:
            print(f"   [MISSING] {file}")
            all_exist = False
    
    return all_exist

def check_app_structure():
    """Check if app.py has required features"""
    print("\n[CHECK] Checking App Structure...")
    
    app_path = Path('app.py')
    if not app_path.exists():
        print("   [FAIL] app.py not found")
        return False
    
    content = app_path.read_text()
    
    checks = [
        ('PORT environment variable', 'os.getenv("PORT"', 'os.getenv(\'PORT\''),
        ('FastAPI app', 'FastAPI('),
        ('CORS middleware', 'CORSMiddleware'),
        ('Health endpoint', '@app.get("/health")'),
        ('Static file serving', 'FileResponse'),
        ('API proxy endpoints', '/api/v1/'),
    ]
    
    all_good = True
    for check_name, *patterns in checks:
        found = any(pattern in content for pattern in patterns)
        if found:
            print(f"   [OK] {check_name}")
        else:
            print(f"   [FAIL] {check_name} - NOT FOUND")
            all_good = False
    
    return all_good

def main():
    print("=" * 60)
    print("Aha! Catcher - Deployment Readiness Check")
    print("=" * 60)
    print()
    
    # Check files
    files_ok = check_files()
    print()
    
    # Check app structure
    structure_ok = check_app_structure()
    print()
    
    # Test API connection
    api_ok = test_api_connection()
    print()
    
    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    
    if files_ok and structure_ok and api_ok:
        print("[SUCCESS] All checks passed! Ready to deploy.")
        print()
        print("Next steps:")
        print("1. Push code to GitHub (public repository)")
        print("2. Run: python deploy.py --repo-url YOUR_REPO_URL")
    else:
        print("[FAIL] Some checks failed. Please fix issues before deploying.")
        if not files_ok:
            print("   - Missing required files")
        if not structure_ok:
            print("   - App structure issues")
        if not api_ok:
            print("   - API connection issues")

if __name__ == "__main__":
    main()
