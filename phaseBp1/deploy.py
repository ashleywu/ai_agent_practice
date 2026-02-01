#!/usr/bin/env python3
"""
Deploy Aha! Catcher to AI Builder Platform using the deployment API
"""

import requests
import json
import time
import sys
from pathlib import Path

# Load API credentials from .env file
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

if not API_KEY:
    print("ERROR: AI_BUILDER_API_KEY not found in .env file!")
    sys.exit(1)

# Disable proxy for all requests (fixes connection issues)
# Clear proxy environment variables
import os
for proxy_var in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

# Set proxies to None for requests library
NO_PROXY = {'http': None, 'https': None}

def deploy_to_platform(repo_url, service_name, branch="main", port=8000):
    """Deploy the application using the AI Builder Platform API"""
    
    deployment_url = f"{API_BASE_URL}/v1/deployments"
    
    # Environment variables for the deployment
    env_vars = {
        "AI_BUILDER_BASE_URL": API_BASE_URL,
        "AI_BUILDER_API_KEY": API_KEY
    }
    
    payload = {
        "repo_url": repo_url,
        "service_name": service_name,
        "branch": branch,
        "port": port,
        "env_vars": env_vars
    }
    
    print("[DEPLOY] Deploying to AI Builder Platform...")
    print(f"   Repository: {repo_url}")
    print(f"   Service: {service_name}")
    print(f"   Branch: {branch}")
    print(f"   Port: {port}")
    print()
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Use NO_PROXY to bypass proxy settings
        response = requests.post(deployment_url, json=payload, headers=headers, proxies=NO_PROXY, timeout=120)
        
        if response.status_code == 202:
            data = response.json()
            print("[SUCCESS] Deployment queued successfully!")
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Service: {data.get('service_name', 'unknown')}")
            
            if 'streaming_logs' in data and data['streaming_logs']:
                print("\n[LOGS] Build Logs:")
                print(data['streaming_logs'])
            
            if 'public_url' in data and data['public_url']:
                print(f"\n[URL] Public URL: {data['public_url']}")
            
            if 'suggested_actions' in data:
                print("\n[NEXT] Next Steps:")
                for action in data['suggested_actions']:
                    print(f"   - {action}")
            
            # Poll for deployment status
            print("\n[WAIT] Waiting for deployment to complete...")
            check_deployment_status(service_name)
            
        else:
            print(f"[FAIL] Deployment failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Error: {response.text}")
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"[FAIL] Request failed: {e}")
        sys.exit(1)

def check_deployment_status(service_name, max_wait=600):
    """Check deployment status until it's complete"""
    status_url = f"{API_BASE_URL}/v1/deployments/{service_name}"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    
    # Disable proxy for status checks
    proxies = {'http': None, 'https': None}
    
    start_time = time.time()
    last_status = None
    
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(status_url, headers=headers, proxies=NO_PROXY, timeout=30)
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                
                if status != last_status:
                    print(f"   Status: {status}")
                    last_status = status
                
                # Check if deployment is complete
                if status in ['HEALTHY', 'UNHEALTHY', 'DEGRADED', 'ERROR']:
                    print(f"\n[DONE] Deployment finished with status: {status}")
                    
                    if 'public_url' in data and data['public_url']:
                        print(f"[URL] Your app is available at: {data['public_url']}")
                    
                    if status == 'HEALTHY':
                        print("[SUCCESS] Deployment successful!")
                    else:
                        print("[WARN] Deployment completed but service is not healthy")
                        if 'message' in data:
                            print(f"   Message: {data['message']}")
                    
                    return status
                
                # Still deploying
                time.sleep(10)
            else:
                print(f"   Error checking status: {response.status_code}")
                time.sleep(10)
                
        except requests.exceptions.RequestException as e:
            print(f"   Error checking status: {e}")
            time.sleep(10)
    
    print(f"\n[TIMEOUT] Timeout waiting for deployment (waited {max_wait}s)")
    return None

def list_deployments():
    """List all deployments"""
    deployments_url = f"{API_BASE_URL}/v1/deployments"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    
    try:
        response = requests.get(deployments_url, headers=headers, proxies=NO_PROXY, timeout=30)
        if response.status_code == 200:
            data = response.json()
            deployments = data.get('deployments', [])
            active_count = data.get('active_count', 0)
            limit = data.get('limit', 0)
            
            print(f"[LIST] Your Deployments ({active_count}/{limit} active):")
            print()
            
            if deployments:
                for dep in deployments:
                    status = dep.get('status', 'unknown')
                    service_name = dep.get('service_name', 'unknown')
                    public_url = dep.get('public_url', 'N/A')
                    
                    status_marker = {
                        'HEALTHY': '[OK]',
                        'UNHEALTHY': '[FAIL]',
                        'DEGRADED': '[WARN]',
                        'ERROR': '[ERROR]',
                        'queued': '[QUEUED]',
                        'deploying': '[DEPLOYING]',
                        'SLEEPING': '[SLEEPING]'
                    }.get(status, '[?]')
                    
                    print(f"{status_marker} {service_name}")
                    print(f"   Status: {status}")
                    print(f"   URL: {public_url}")
                    print()
            else:
                print("   No deployments found")
        else:
            print(f"[FAIL] Failed to list deployments: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"[FAIL] Request failed: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Deploy Aha! Catcher to AI Builder Platform')
    parser.add_argument('--repo-url', help='Git repository URL (must be public)')
    parser.add_argument('--service-name', default='pw-aha-catcher', help='Service name (default: pw-aha-catcher)')
    parser.add_argument('--branch', default='main', help='Git branch (default: main)')
    parser.add_argument('--port', type=int, default=8000, help='Port (default: 8000)')
    parser.add_argument('--list', action='store_true', help='List existing deployments')
    
    args = parser.parse_args()
    
    if args.list:
        list_deployments()
    elif args.repo_url:
        deploy_to_platform(
            repo_url=args.repo_url,
            service_name=args.service_name,
            branch=args.branch,
            port=args.port
        )
    else:
        print("Usage:")
        print("  Deploy: python deploy.py --repo-url https://github.com/username/repo")
        print("  List:   python deploy.py --list")
        print()
        print("Options:")
        print("  --service-name NAME  Service name (default: pw-aha-catcher)")
        print("  --branch BRANCH      Git branch (default: main)")
        print("  --port PORT          Port number (default: 8000)")
