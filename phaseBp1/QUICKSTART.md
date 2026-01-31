# Quick Start Guide - Fixing "Failed to fetch" Error

## The Problem

The "Failed to fetch" error occurs because browsers block direct API calls from web pages due to CORS (Cross-Origin Resource Sharing) policies. When you open `index.html` directly in a browser, it tries to make requests to `https://space.ai-builders.com/backend`, but the browser blocks these requests.

## Solution: Use the Proxy Server

A simple Python proxy server has been created to handle CORS and securely proxy API requests.

### Step 1: Start the Proxy Server

Open a terminal in the `phaseBp1` directory and run:

```bash
python server.py
```

You should see:
```
Starting proxy server on http://localhost:8080
API Base URL: https://space.ai-builders.com/backend
Open http://localhost:8080 in your browser
```

**Note:** If port 8080 is in use, you can specify a different port:
```bash
python server.py 5000
```

### Step 2: Open the Web App

Open your browser and go to:
```
http://localhost:8080
```

The proxy server will:
- Serve the HTML file
- Automatically replace API URLs to use the proxy
- Handle CORS headers
- Securely add your API key from the `.env` file

### Step 3: Test the App

1. Grant microphone permissions when prompted
2. Speak your "Aha!" moment
3. Click "Capture Aha!" button
4. View transcription and research summary

## Alternative: Direct File Access (May Not Work)

If you want to test without the proxy server, you can try opening `index.html` directly, but you may encounter CORS errors. Some browsers allow this for local development, but it's not reliable.

## Troubleshooting

### "Failed to fetch" still appears
- Make sure the proxy server is running (`python server.py`)
- Check that you're accessing `http://localhost:8080` (or your chosen port, not `file://`)
- Check the terminal for proxy server error messages
- Verify your `.env` file has the correct API key
- Make sure the port in the URL matches the port the server is running on

### Microphone not working
- Check browser permissions (look for microphone icon in address bar)
- Make sure you're using HTTPS or localhost (required for microphone access)
- Try a different browser

### API errors
- Check the proxy server terminal for detailed error messages
- Verify your API key in `.env` is correct
- Check that the API endpoint is accessible

## How It Works

1. **Browser** → Makes request to `http://localhost:8080/api/v1/audio/transcriptions`
2. **Proxy Server** → Receives request, adds API key from `.env`, forwards to `https://space.ai-builders.com/backend/v1/audio/transcriptions`
3. **API Server** → Processes request and returns response
4. **Proxy Server** → Adds CORS headers and returns response to browser
5. **Browser** → Displays results

This approach:
- ✅ Avoids CORS issues
- ✅ Keeps API keys secure (not exposed in browser)
- ✅ Works with any browser
- ✅ Simple to set up and run
