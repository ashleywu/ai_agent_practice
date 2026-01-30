'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import { Conversation, Message, Model } from './types'

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [systemMessage, setSystemMessage] = useState<string>('')
  const [model, setModel] = useState<Model>('grok-4-fast')

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('conversations')
    if (saved) {
      const parsed = JSON.parse(saved)
      setConversations(parsed)
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id)
      }
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      systemMessage: systemMessage || undefined,
      model: model,
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
  }, [systemMessage, model])

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
    // Load system message and model from selected conversation
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setSystemMessage(conv.systemMessage || '')
      setModel(conv.model || 'grok-4-fast')
    }
  }, [conversations])

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
    if (currentConversationId === id) {
      const remaining = conversations.filter((conv) => conv.id !== id)
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null)
    }
  }, [currentConversationId, conversations])

  const generateTitleFromMessage = useCallback(async (message: string): Promise<string> => {
    try {
      // Generate a concise title from the first message using AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a short, descriptive title (max 5 words) for this conversation starter: "${message}"\n\nRespond with only the title, nothing else.`,
            },
          ],
          model: 'grok-4-fast', // Use fast model for title generation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate title')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let title = ''
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '' || data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  title += delta
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Clean up the title - remove quotes and limit length
      title = title.trim().replace(/^["']|["']$/g, '').slice(0, 50)
      return title || message.slice(0, 50) + (message.length > 50 ? '...' : '')
    } catch (error) {
      console.error('Error generating title:', error)
      // Fallback to simple truncation
      return message.slice(0, 50) + (message.length > 50 ? '...' : '')
    }
  }, [])

  const updateConversationTitle = useCallback(async (id: string, firstMessage: string) => {
    // Set a temporary title first
    const tempTitle = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, title: tempTitle, updatedAt: Date.now() }
          : conv
      )
    )
    
    // Generate AI title and update
    const title = await generateTitleFromMessage(firstMessage)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, title, updatedAt: Date.now() }
          : conv
      )
    )
  }, [generateTitleFromMessage])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversationId) return

    setIsLoading(true)

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: Date.now(),
            }
          : conv
      )
    )

    // Update title if this is the first message (async, don't await)
    const currentConv = conversations.find((c) => c.id === currentConversationId)
    if (currentConv && currentConv.messages.length === 0) {
      // Update system message and model in conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { 
                ...conv, 
                systemMessage: systemMessage || undefined,
                model: model,
              }
            : conv
        )
      )
      // Generate title asynchronously
      updateConversationTitle(currentConversationId, content)
    }

    try {
      // Get all messages including the new user message
      const updatedConv = conversations.find((c) => c.id === currentConversationId)
      
      // Build messages array with system message if present
      const allMessages: Array<{ role: string; content: string }> = []
      
      // Add system message if it exists
      if (systemMessage.trim()) {
        allMessages.push({
          role: 'system',
          content: systemMessage.trim(),
        })
      }
      
      // Add conversation messages
      const conversationMessages = [
        ...(updatedConv?.messages || []),
        userMessage,
      ].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      
      allMessages.push(...conversationMessages)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: allMessages, model }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '' || data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta !== undefined && delta !== null && delta !== '') {
                  assistantContent += delta

                  // Update the assistant message in real-time
                  setConversations((prev) =>
                    prev.map((conv) => {
                      if (conv.id !== currentConversationId) return conv

                      const existingAssistantMsg = conv.messages.find(
                        (m) => m.role === 'assistant' && m.id === 'streaming'
                      )

                      if (existingAssistantMsg) {
                        return {
                          ...conv,
                          messages: conv.messages.map((m) =>
                            m.id === 'streaming'
                              ? { ...m, content: assistantContent }
                              : m
                          ),
                        }
                      } else {
                        return {
                          ...conv,
                          messages: [
                            ...conv.messages,
                            {
                              id: 'streaming',
                              role: 'assistant',
                              content: assistantContent,
                              timestamp: Date.now(),
                            },
                          ],
                        }
                      }
                    })
                  )
                }
              } catch (e) {
                // Ignore JSON parse errors for malformed chunks
                console.debug('Failed to parse SSE chunk:', data)
              }
            }
          }
        }
      }

      // Replace streaming message with final message
      if (!assistantContent.trim()) {
        throw new Error('Empty response received from AI model')
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: conv.messages
                  .filter((m) => m.id !== 'streaming')
                  .concat(assistantMessage),
                updatedAt: Date.now(),
              }
            : conv
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message with more details
      const errorDetails = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorDetails}. Please check the console for more details.`,
        timestamp: Date.now(),
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter((m) => m.id !== 'streaming'),
                  errorMessage,
                ],
              }
            : conv
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId, conversations, updateConversationTitle, systemMessage, model])

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentConversationId) return

    const currentConv = conversations.find((c) => c.id === currentConversationId)
    if (!currentConv) return

    const messageIndex = currentConv.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1 || currentConv.messages[messageIndex].role !== 'user') return

    // Update the message content
    const updatedMessages = currentConv.messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    )

    // Check if there's an assistant response right after this user message
    const nextMessage = updatedMessages[messageIndex + 1]
    const shouldRegenerate = nextMessage && nextMessage.role === 'assistant'

    // Update the conversation with edited message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: shouldRegenerate 
                ? updatedMessages.slice(0, messageIndex + 1) // Remove assistant response
                : updatedMessages,
              updatedAt: Date.now(),
            }
          : conv
      )
    )

    // If there's an assistant response, regenerate it
    if (shouldRegenerate) {
      setIsLoading(true)
      
      try {
        // Build messages array with system message if present
        const allMessages: Array<{ role: string; content: string }> = []
        
        if (systemMessage.trim()) {
          allMessages.push({
            role: 'system',
            content: systemMessage.trim(),
          })
        }
        
        // Get all messages up to and including the edited message
        const messagesToSend = updatedMessages.slice(0, messageIndex + 1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
        
        allMessages.push(...messagesToSend)

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: allMessages, model }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response')
        }

        // Handle streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''
        let buffer = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '' || data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const delta = parsed.choices?.[0]?.delta?.content
                  if (delta) {
                    assistantContent += delta

                    setConversations((prev) =>
                      prev.map((conv) => {
                        if (conv.id !== currentConversationId) return conv

                        const existingAssistantMsg = conv.messages.find(
                          (m) => m.role === 'assistant' && m.id === 'streaming'
                        )

                        if (existingAssistantMsg) {
                          return {
                            ...conv,
                            messages: conv.messages.map((m) =>
                              m.id === 'streaming'
                                ? { ...m, content: assistantContent }
                                : m
                            ),
                          }
                        } else {
                          return {
                            ...conv,
                            messages: [
                              ...conv.messages,
                              {
                                id: 'streaming',
                                role: 'assistant',
                                content: assistantContent,
                                timestamp: Date.now(),
                              },
                            ],
                          }
                        }
                      })
                    )
                  }
                } catch (e) {
                  console.debug('Failed to parse SSE chunk:', data)
                }
              }
            }
          }
        }

        // Replace streaming message with final message
        if (!assistantContent.trim()) {
          throw new Error('Empty response received from AI model')
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: conv.messages
                    .filter((m) => m.id !== 'streaming')
                    .concat(assistantMessage),
                  updatedAt: Date.now(),
                }
              : conv
          )
        )
      } catch (error) {
        console.error('Error regenerating response after edit:', error)
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }
  }, [currentConversationId, conversations, systemMessage, model])

  const deleteMessage = useCallback((messageId: string) => {
    if (!currentConversationId) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: conv.messages.filter((msg) => msg.id !== messageId),
              updatedAt: Date.now(),
            }
          : conv
      )
    )
  }, [currentConversationId])

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!currentConversationId) return

    setIsLoading(true)

    const currentConv = conversations.find((c) => c.id === currentConversationId)
    if (!currentConv) {
      setIsLoading(false)
      return
    }

    const messageIndex = currentConv.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1 || currentConv.messages[messageIndex].role !== 'assistant') {
      setIsLoading(false)
      return
    }

    const messagesToKeep = currentConv.messages.slice(0, messageIndex)
    
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: messagesToKeep,
              updatedAt: Date.now(),
            }
          : conv
      )
    )

    const lastUserMessage = messagesToKeep.filter((m) => m.role === 'user').pop()
    if (!lastUserMessage) {
      setIsLoading(false)
      return
    }

    try {
      const allMessages: Array<{ role: string; content: string }> = []
      
      if (systemMessage.trim()) {
        allMessages.push({
          role: 'system',
          content: systemMessage.trim(),
        })
      }
      
      const conversationMessages = messagesToKeep.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      
      allMessages.push(...conversationMessages)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: allMessages, model }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '' || data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta !== undefined && delta !== null && delta !== '') {
                  assistantContent += delta

                  setConversations((prev) =>
                    prev.map((conv) => {
                      if (conv.id !== currentConversationId) return conv

                      const existingAssistantMsg = conv.messages.find(
                        (m) => m.role === 'assistant' && m.id === 'streaming'
                      )

                      if (existingAssistantMsg) {
                        return {
                          ...conv,
                          messages: conv.messages.map((m) =>
                            m.id === 'streaming'
                              ? { ...m, content: assistantContent }
                              : m
                          ),
                        }
                      } else {
                        return {
                          ...conv,
                          messages: [
                            ...conv.messages,
                            {
                              id: 'streaming',
                              role: 'assistant',
                              content: assistantContent,
                              timestamp: Date.now(),
                            },
                          ],
                        }
                      }
                    })
                  )
                }
              } catch (e) {
                console.debug('Failed to parse SSE chunk:', data)
              }
            }
          }
        }
      }

      if (!assistantContent.trim()) {
        throw new Error('Empty response received from AI model')
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: conv.messages
                  .filter((m) => m.id !== 'streaming')
                  .concat(assistantMessage),
                updatedAt: Date.now(),
              }
            : conv
        )
      )
    } catch (error) {
      console.error('Error regenerating response:', error)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId, conversations, systemMessage, model])

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  ) || null

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onEditTitle={(id, title) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
            )
          )
        }}
      />
      <div className="flex-1">
        <ChatInterface
          conversation={currentConversation}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          systemMessage={systemMessage}
          onSystemMessageChange={setSystemMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onRegenerateResponse={regenerateResponse}
          model={model}
          onModelChange={(newModel) => {
            setModel(newModel)
            // Update model in current conversation
            if (currentConversationId) {
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === currentConversationId
                    ? { ...conv, model: newModel, updatedAt: Date.now() }
                    : conv
                )
              )
            }
          }}
        />
      </div>
    </div>
  )
}
