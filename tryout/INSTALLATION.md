# Installation Guide

## Prerequisites

- Google Chrome browser
- API key for AI Builder (stored in `.env` file)

## Step-by-Step Installation

### 1. Prepare Icons

First, you need to create icon files for the extension:

**Option A: Use the icon generator**
1. Open `create_icons.html` in your browser
2. Right-click each canvas and "Save image as..."
3. Save as `icon16.png`, `icon48.png`, `icon128.png` in the `extension/icons/` folder

**Option B: Create your own icons**
- Create three PNG files: 16x16, 48x48, and 128x128 pixels
- Place them in `extension/icons/` folder
- Name them: `icon16.png`, `icon48.png`, `icon128.png`

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle switch in the top right corner)
3. Click **"Load unpacked"** button
4. Navigate to and select the `extension` folder from this project
5. The extension should now appear in your extensions list

### 3. Configure API Settings

1. Click the extension icon in Chrome's toolbar
2. Enter your API key in the "API Key" field
3. Verify the Base URL is `https://space.ai-builders.com/backend`
4. Click **"Save Configuration"**

**Note**: The extension will use default API credentials from `.env` file on first run, but you should configure it via the popup for production use.

### 4. Verify Installation

- The status indicator should show "Tracking active" (green dot)
- The extension will automatically start tracking your browsing

## Troubleshooting

### Extension not loading
- Make sure you selected the `extension` folder, not the parent folder
- Check that `manifest.json` exists in the extension folder
- Open Chrome DevTools (F12) and check for errors in the Console

### API errors
- Verify your API key is correct
- Check that the base URL is correct
- Open the extension popup and re-save the configuration

### Not tracking
- Check the status indicator in the popup
- Make sure you're browsing regular websites (not chrome:// pages)
- Check Chrome's extension permissions

## Development

To modify the extension:

1. Make your changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. The changes will be reloaded

## Data Export

To export your tracking data:

1. Click the extension icon
2. Click **"Export Data"**
3. A JSON file will be downloaded with all your tracking data

## Uninstallation

1. Go to `chrome://extensions/`
2. Find "Browsing Behavior Tracker"
3. Click "Remove"
4. Confirm removal

**Note**: This will delete all stored tracking data. Export your data first if you want to keep it.
