import { NextRequest, NextResponse } from 'next/server'

const AI_BUILDER_BASE_URL = process.env.AI_BUILDER_BASE_URL || 'https://space.ai-builders.com/backend'
const AI_BUILDER_API_KEY = process.env.AI_BUILDER_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!AI_BUILDER_API_KEY) {
      return NextResponse.json(
        { error: 'AI_BUILDER_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const { messages, model = 'grok-4-fast' } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Validate model
    const validModels = [
      'grok-4-fast',
      'supermind-agent-v1',
      'deepseek',
      'gemini-2.5-pro',
      'gemini-3-flash-preview',
      'gpt-5'
    ]
    const selectedModel = validModels.includes(model) ? model : 'grok-4-fast'
    
    // Models that don't support streaming
    const nonStreamingModels = ['supermind-agent-v1']
    const supportsStreaming = !nonStreamingModels.includes(selectedModel)
    
    // Handle GPT-5 special requirements
    const requestBody: any = {
      model: selectedModel,
      messages: messages,
      stream: supportsStreaming,
    }
    
    if (selectedModel === 'gpt-5') {
      // GPT-5 requires temperature=1.0 and max_completion_tokens instead of max_tokens
      requestBody.temperature = 1.0
      // Note: max_tokens will be converted to max_completion_tokens by the API
    } else {
      requestBody.temperature = 0.7
    }

    const response = await fetch(`${AI_BUILDER_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_BUILDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    // Handle streaming vs non-streaming responses
    if (supportsStreaming) {
      // Return the stream for models that support it
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // For non-streaming models, return the complete response as a stream-like format
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      // Convert to SSE format for consistency with frontend
      const sseData = `data: ${JSON.stringify({
        choices: [{
          delta: { content: content },
          finish_reason: 'stop'
        }]
      })}\n\ndata: [DONE]\n\n`
      
      return new NextResponse(sseData, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
