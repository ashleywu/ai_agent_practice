# ChatGPT Clone - Next.js Application

A ChatGPT-like interface built with Next.js, featuring a two-column layout with conversation management and real-time streaming chat using the AI Builders API with Grok-4-Fast model.

## Features

- 🎨 **Two-Column Interface**: Left sidebar for conversations, right panel for chat
- 💬 **Conversation Management**: Create, select, and delete conversations
- ⚡ **Real-time Streaming**: Live streaming responses from the AI model
- 🎯 **Modern UI**: Clean, dark-themed interface similar to ChatGPT
- 💾 **Local Storage**: Conversations are saved in browser localStorage
- 🔄 **Auto-scroll**: Messages automatically scroll to bottom

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **AI Builders API** - Backend API with Grok-4-Fast model

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Make sure your `.env` file contains:
   ```
   AI_BUILDER_API_KEY=your_api_key_here
   AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
app/
  ├── api/
  │   └── chat/
  │       └── route.ts          # API route for chat completions
  ├── components/
  │   ├── Sidebar.tsx           # Left sidebar with conversations
  │   └── ChatInterface.tsx     # Right panel with chat UI
  ├── page.tsx                  # Main page component
  ├── layout.tsx                # Root layout
  ├── globals.css               # Global styles
  └── types.ts                  # TypeScript type definitions
```

## Usage

1. **Create a New Conversation**: Click "New Chat" button in the sidebar
2. **Send Messages**: Type your message and press Enter or click Send
3. **Switch Conversations**: Click on any conversation in the sidebar
4. **Delete Conversations**: Hover over a conversation and click the trash icon
5. **View Responses**: AI responses stream in real-time as they're generated

## API Integration

The app uses the AI Builders API endpoint:
- **Endpoint**: `/v1/chat/completions`
- **Model**: `grok-4-fast`
- **Authentication**: Bearer token from `AI_BUILDER_API_KEY`
- **Streaming**: Enabled for real-time responses

## Building for Production

```bash
npm run build
npm start
```

## Notes

- Conversations are stored in browser localStorage
- The app uses server-side API routes to keep API keys secure
- Streaming responses are handled client-side for real-time updates
