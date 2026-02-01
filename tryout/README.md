# Browsing Behavior Tracker

A Chrome Extension that automatically tracks your browsing time and classifies websites into work, entertainment, or other categories.

## Features

- **Automatic Tracking**: Passively observes your active browser tabs and records time spent on each
- **Smart Classification**: Automatically classifies websites into work, entertainment, or other categories
- **Focus Sessions**: Tracks sustained focus duration on non-entertaining content
- **Zero Manual Input**: Fully automated, requires no manual tagging or annotation

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder from this repository

## Configuration

1. Click the extension icon in Chrome toolbar
2. Enter your API key and base URL in the popup
3. Click "Save Configuration"

The extension will use the AI Builder API (https://space.ai-builders.com/backend) for intelligent website classification.

## Usage

Once installed, the extension automatically starts tracking:
- Tab switches within windows
- Window focus changes
- URL changes
- Time spent on each website

No manual intervention required!

## Data Export

Click "Export Data" in the popup to download your tracking data as JSON. The exported file includes:
- Timeline records (all browsing sessions)
- Summary statistics (total time, work time, entertainment time)
- Focus sessions (sustained non-entertainment periods)

## Project Structure

```
extension/
├── manifest.json              # Extension manifest
├── background.js              # Core tracking logic (Service Worker)
├── popup/
│   ├── popup.html             # Popup UI
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup logic
├── utils/
│   ├── storage.js             # Data storage utilities
│   └── category-classifier.js # Website classification logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Development

### Core Components

1. **Background.js**: Service Worker that tracks tab/window changes
2. **Category Classifier**: Classifies websites using predefined rules and API calls
3. **Storage Manager**: Handles data persistence using chrome.storage.local

### API Integration

The extension uses the AI Builder API for intelligent classification:
- Endpoint: `https://space.ai-builders.com/backend/v1/chat/completions`
- Model: `deepseek` (for YouTube video classification)
- API key stored in chrome.storage.local (set via popup)

## License

MIT
