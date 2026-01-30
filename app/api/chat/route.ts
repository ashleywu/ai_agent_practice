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

    // Log request for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${selectedModel}] Request:`, {
        model: selectedModel,
        stream: supportsStreaming,
        messagesCount: messages.length,
        temperature: requestBody.temperature
      })
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
      let errorText = ''
      try {
        errorText = await response.text()
      } catch (e) {
        errorText = `HTTP ${response.status} ${response.statusText}`
      }
      console.error('AI Builder API error:', response.status, errorText)
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
      try {
        // Get response as text first to handle potential non-JSON responses
        const responseText = await response.text()
        let data: any
        
        try {
          data = JSON.parse(responseText)
        } catch (parseErr) {
          // If not JSON, treat as plain text content
          console.error('Non-JSON response received for non-streaming model')
          const sseData = `data: ${JSON.stringify({
            choices: [{
              delta: { content: responseText },
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
        
        // Log response structure for debugging
        console.log(`[${selectedModel}] Response structure:`, {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length,
          firstChoiceKeys: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
          messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : null,
          hasToolCalls: !!data.choices?.[0]?.message?.tool_calls,
          toolCallsLength: data.choices?.[0]?.message?.tool_calls?.length
        })
        
        // Try different possible response structures
        let content = ''
        
        // Standard OpenAI format
        if (data.choices?.[0]?.message?.content) {
          content = data.choices[0].message.content
        }
        // Alternative format: direct content
        else if (data.content) {
          content = data.content
        }
        // Alternative format: choices[0].content
        else if (data.choices?.[0]?.content) {
          content = data.choices[0].content
        }
        // Alternative format: result or response field
        else if (data.result) {
          content = data.result
        }
        else if (data.response) {
          content = data.response
        }
        // Check for tool calls or function calls (supermind-agent-v1 uses these)
        else if (data.choices?.[0]?.message?.tool_calls && data.choices[0].message.tool_calls.length > 0) {
          // Handle tool calls - supermind-agent-v1 uses tool calls for web search, etc.
          const toolCalls = data.choices[0].message.tool_calls
          const toolCallTexts = toolCalls.map((tc: any, idx: number) => {
            try {
              const funcName = tc.function?.name || 'unknown'
              const args = tc.function?.arguments ? (typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments) : {}
              return `Tool Call ${idx + 1}: ${funcName}${Object.keys(args).length > 0 ? ` with arguments: ${JSON.stringify(args)}` : ''}`
            } catch (e) {
              return `Tool Call ${idx + 1}: ${tc.function?.name || 'unknown'}`
            }
          })
          content = `[Agent executed ${toolCalls.length} tool call(s)]\n\n${toolCallTexts.join('\n')}\n\nNote: The agent is processing your request. Results will appear shortly.`
        }
        // Check if message exists but content is empty (might be assistant message preparation)
        else if (data.choices?.[0]?.message && !data.choices[0].message.content && !data.choices[0].message.tool_calls) {
          // Message exists but no content - might be waiting for tool execution
          content = '[Agent is processing your request. This may take a moment...]'
        }
        
        if (!content || content.trim() === '') {
          console.error(`[${selectedModel}] No content found in API response. Full response:`, JSON.stringify(data, null, 2))
          return NextResponse.json(
            { 
              error: `No content received from ${selectedModel} model`,
              debug: {
                model: selectedModel,
                responseStructure: Object.keys(data),
                choicesLength: data.choices?.length,
                firstChoice: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
                message: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : null
              }
            },
            { status: 500 }
          )
        }
        
        // Convert to SSE format for consistency with frontend
        const sseData = `data: ${JSON.stringify({
          choices: [{
            delta: { content: content },
            finish_reason: data.choices?.[0]?.finish_reason || 'stop'
          }]
        })}\n\ndata: [DONE]\n\n`
        
        return new NextResponse(sseData, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (parseError) {
        console.error('Error parsing non-streaming response:', parseError)
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('Raw response text:', errorText)
        return NextResponse.json(
          { error: `Failed to parse API response: ${errorText}` },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
