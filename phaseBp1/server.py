#!/usr/bin/env python3
"""
Simple proxy server for Aha! Catcher web app.
This server proxies API requests to avoid CORS issues.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse
import json
import os
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

# Validate configuration on startup
if not API_KEY:
    print("WARNING: AI_BUILDER_API_KEY not found in .env file!")
    print("API requests will fail without a valid API key.")
else:
    print(f"API Key loaded: {API_KEY[:20]}...{API_KEY[-10:]}")

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        """Serve the HTML file"""
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
            try:
                with open('index.html', 'rb') as f:
                    content = f.read().decode('utf-8')
                    # Replace API_BASE_URL to always use proxy when served by this server
                    import re
                    port_str = str(self.server.server_address[1])
                    proxy_url = f'`http://localhost:{port_str}/api`'
                    
                    # Replace the entire API_BASE_URL assignment (handles multi-line ternary)
                    # Match from "const API_BASE_URL" to the semicolon, including newlines
                    pattern = r'const API_BASE_URL\s*=\s*isLocalhost\s*\?[^;]*;'
                    replacement = f'const API_BASE_URL = {proxy_url};'
                    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                    
                    # Also ensure isLocalhost is true
                    content = content.replace(
                        "const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';",
                        "const isLocalhost = true; // Always use proxy when served by proxy server"
                    )
                    
                    # Debug: verify replacement worked
                    if proxy_url.encode('utf-8') not in content.encode('utf-8'):
                        print(f"Warning: API_BASE_URL replacement may have failed. Expected: {proxy_url}")
                    
                    content = content.encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(content)
            except FileNotFoundError:
                self.send_error(404, "File not found")
        else:
            self.send_error(404, "File not found")

    def do_POST(self):
        """Proxy API requests"""
        if self.path.startswith('/api/'):
            # Extract the API endpoint
            api_path = self.path[4:]  # Remove '/api' prefix
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Determine content type - preserve multipart boundary if present
            content_type = self.headers.get('Content-Type', 'application/json')
            
            # For multipart/form-data, we need to preserve the boundary parameter
            if 'multipart/form-data' in content_type:
                print(f"Multipart request detected: {content_type[:100]}...")
            
            # Build the full API URL
            api_url = f"{API_BASE_URL}{api_path}"
            
            print(f"Proxying request to: {api_url}")
            print(f"Content-Type: {content_type}")
            print(f"Body size: {len(body)} bytes")
            print(f"API Key present: {bool(API_KEY)}")
            
            try:
                # Create request to API
                req = urllib.request.Request(api_url, data=body)
                req.add_header('Authorization', f'Bearer {API_KEY}')
                req.add_header('Content-Type', content_type)
                
                # Make the request
                with urllib.request.urlopen(req) as response:
                    response_data = response.read()
                    response_code = response.getcode()
                    response_headers = dict(response.headers)
                    
                    print(f"API Response: {response_code}")
                    
                    # Send response back to client
                    self.send_response(response_code)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', response_headers.get('Content-Type', 'application/json'))
                    self.end_headers()
                    self.wfile.write(response_data)
                    
            except urllib.error.HTTPError as e:
                # Read error response body
                try:
                    error_body = e.read()
                    error_text = error_body.decode('utf-8') if error_body else 'No error body'
                    print(f"API Error {e.code}: {error_text}")
                except Exception as read_error:
                    error_body = f'{{"error": "Failed to read error response: {str(read_error)}"}}'.encode('utf-8')
                    error_text = str(read_error)
                    print(f"API Error {e.code}: Could not read error body - {read_error}")
                
                # Send error response to client
                self.send_response(e.code)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(error_body if isinstance(error_body, bytes) else error_body.encode('utf-8'))
                
            except urllib.error.URLError as e:
                error_msg = f"Network error: {str(e)}"
                print(f"URLError: {error_msg}")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_response = json.dumps({"error": error_msg}).encode('utf-8')
                self.wfile.write(error_response)
                
            except Exception as e:
                import traceback
                error_msg = f"Proxy error: {str(e)}"
                traceback_str = traceback.format_exc()
                print(f"Exception in proxy: {error_msg}")
                print(f"Traceback:\n{traceback_str}")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_response = json.dumps({
                    "error": error_msg,
                    "details": traceback_str
                }).encode('utf-8')
                self.wfile.write(error_response)
        else:
            self.send_error(404, "Not found")

    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{self.address_string()}] {format % args}")

def run(server_class=HTTPServer, handler_class=ProxyHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting proxy server on http://localhost:{port}")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Open http://localhost:{port} in your browser")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\nError: Port {port} is already in use.")
            print(f"Try running with a different port: python server.py {port + 1}")
        else:
            raise

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port=port)
