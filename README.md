# AI Agent Practice - ChatGPT Clone

A modern ChatGPT-like interface built with Next.js, featuring conversation management, multiple AI models, and markdown rendering.

## 🚀 Features

- **Two-Column Interface**: Left sidebar for conversations, right panel for chat
- **Multiple AI Models**: Support for 6 different models:
  - Grok-4-Fast - Fast passthrough to X.AI's Grok API
  - Supermind Agent v1 - Multi-tool agent with web search and Gemini handoff
  - DeepSeek - Fast and cost-effective chat completions
  - Gemini 2.5 Pro - Direct access to Google's Gemini model
  - Gemini 3 Flash - Fast Gemini reasoning model
  - GPT-5 - OpenAI-compatible passthrough
- **Conversation Management**: Create, edit, delete, and switch between conversations
- **Message Editing**: Edit user messages with automatic response regeneration
- **Markdown Rendering**: Beautiful markdown rendering for AI responses
- **System Messages**: Add custom system prompts (no-chat mode)
- **Auto-Generated Titles**: AI-powered conversation title generation
- **Real-time Streaming**: Live streaming responses (for supported models)
- **Local Storage**: Conversations persist in browser localStorage

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons
- **AI Builders API** - Backend API integration

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/AI_agent_practice.git
   cd AI_agent_practice
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   AI_BUILDER_API_KEY=your_api_key_here
   AI_BUILDER_BASE_URL=https://space.ai-builders.com/backend
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Creating Conversations
- Click "New Chat" in the sidebar to start a new conversation
- Conversations are automatically saved to localStorage

### Sending Messages
- Type your message in the input field
- Press `Enter` to send, `Shift+Enter` for a new line
- AI responses stream in real-time (for supported models)

### Editing Messages
- Hover over a user message and click the edit icon
- Modify your message and save (Ctrl+Enter)
- The AI response will automatically regenerate

### Selecting Models
- Use the model dropdown above the input field
- Each conversation remembers its selected model
- Different models have different capabilities

### System Messages
- Check "Add system message (no-chat mode)" to enable
- Customize the system prompt for focused responses

## 📁 Project Structure

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

## 🔧 Configuration

### Environment Variables

- `AI_BUILDER_API_KEY` (required) - Your AI Builders API key
- `AI_BUILDER_BASE_URL` (optional) - API base URL (default: https://space.ai-builders.com/backend)

### Model Configuration

Models are configured in `app/components/ChatInterface.tsx`. To add more models:

1. Add the model to the `Model` type in `app/types.ts`
2. Add model info to the `MODELS` array in `ChatInterface.tsx`
3. Update the API route validation in `app/api/chat/route.ts`

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
