# Aha! Catcher - Web MVP

A simple web-based MVP for capturing "Aha!" moments with automatic transcription and research summary.

## Features

- **Continuous Audio Recording**: Automatically records audio from your microphone into a rolling 30-second buffer
- **One-Click Capture**: Click the "Capture Aha!" button to send the last 30 seconds of audio
- **Automatic Transcription**: Uses AI Builder API to transcribe the audio
- **Research Summary**: Automatically generates a research summary using the `supermind-agent-v1` model

## How to Use

1. **Open `index.html`** in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Grant microphone permissions** when prompted
3. **Speak your "Aha!" moment** - the app continuously records the last 30 seconds
4. **Click "Capture Aha!"** button when ready
5. **View results** - transcription and research summary will appear below

## Technical Details

### Audio Recording
- Uses `MediaRecorder` API for browser-based audio recording
- Maintains a rolling buffer of the last 30 seconds
- Records at 16kHz sample rate with noise suppression
- Audio format: WebM (Opus codec) at 64 kbps

### API Integration
- **Transcription**: `/v1/audio/transcriptions` endpoint
- **Research Summary**: `/v1/chat/completions` endpoint using `supermind-agent-v1` model
- API credentials loaded from `.env` file (hardcoded in HTML for MVP)

### Browser Compatibility
- Requires modern browser with MediaRecorder support
- Chrome 47+, Firefox 25+, Safari 14.1+, Edge 79+
- Requires HTTPS or localhost for microphone access

## File Structure

```
phaseBp1/
├── index.html          # Main web application
├── .env                # API configuration (API key and base URL)
├── requirements.md     # Product definition brief
└── README_WEB.md       # This file
```

## API Configuration

The API key and base URL are currently hardcoded in `index.html`. For production, these should be:
- Loaded from environment variables via a backend proxy
- Or configured via a settings file loaded securely

Current configuration (from `.env`):
- Base URL: `https://space.ai-builders.com/backend`
- API Key: `sk_a0e0e71f_43e132e8652e5da50151514131a46a1d72ae`

## Future Enhancements

- [ ] Backend proxy to hide API keys
- [ ] Audio visualization during recording
- [ ] Save/export captured moments
- [ ] History of previous captures
- [ ] Mobile-responsive design improvements
- [ ] Error handling for network failures
- [ ] Retry mechanism for failed API calls
