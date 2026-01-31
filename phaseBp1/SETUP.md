# Setup Instructions - Fixing CORS Error

## The Problem

You're seeing "Failed to fetch" / CORS errors because the HTML file is trying to make direct API calls, which browsers block.

## Solution: Use the Proxy Server

**Important:** You MUST access the HTML file through the proxy server, not directly or through another server.

### Step 1: Stop any other servers on ports 3000, 8000, or 8080

If you have something running on `localhost:3000` from yesterday, you need to either:
- Stop that server, OR
- Run the proxy server on a different port

### Step 2: Start the Proxy Server

Open a terminal in the `phaseBp1` directory:

```bash
python server.py
```

This will start on port **8080** by default.

### Step 3: Access Through Proxy Server

**CRITICAL:** Open your browser and go to:

```
http://localhost:8080
```

**DO NOT:**
- ❌ Open `index.html` directly (file://)
- ❌ Access through a different server
- ❌ Use `localhost:3000` if that's running something else

### Step 4: Test

1. Grant microphone permissions
2. Click "Capture Aha!" button
3. Should work without CORS errors!

## Why This Works

The proxy server:
1. Serves the HTML file
2. Automatically modifies it to use the proxy for API calls
3. Adds CORS headers to API responses
4. Securely adds your API key from `.env`

## Troubleshooting

### Still getting CORS errors?

1. **Check the URL** - Must be `http://localhost:8080` (not `file://`)
2. **Check the port** - Must be 8080 (default port)
3. **Check the terminal** - Look for errors in the proxy server output
4. **Check browser console** - Press F12, look for detailed error messages

### Port 8080 already in use?

```bash
# Use a different port
python server.py 5000
# Then access http://localhost:5000
```
