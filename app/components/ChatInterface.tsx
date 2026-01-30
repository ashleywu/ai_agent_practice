'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Edit2, Trash2, RotateCcw, X, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message, Conversation, Model, ModelInfo } from '../types'

const MODELS: ModelInfo[] = [
  {
    id: 'grok-4-fast',
    name: 'Grok-4-Fast',
    description: 'Fast passthrough to X.AI\'s Grok API'
  },
  {
    id: 'supermind-agent-v1',
    name: 'Supermind Agent v1',
    description: 'Multi-tool agent with web search and Gemini handoff'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Fast and cost-effective chat completions'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Direct access to Google\'s Gemini model'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Fast Gemini reasoning model'
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'OpenAI-compatible passthrough (temp=1.0)'
  },
]

interface ChatInterfaceProps {
  conversation: Conversation | null
  onSendMessage: (content: string) => Promise<void>
  isLoading: boolean
  systemMessage: string
  onSystemMessageChange: (message: string) => void
  onEditMessage: (messageId: string, newContent: string) => void
  onDeleteMessage: (messageId: string) => void
  onRegenerateResponse: (messageId: string) => void
  model: Model
  onModelChange: (model: Model) => void
}

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  systemMessage,
  onSystemMessageChange,
  onEditMessage,
  onDeleteMessage,
  onRegenerateResponse,
  model,
  onModelChange,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const messageContent = input.trim()
    setInput('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onSendMessage(messageContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter creates new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    // Allow Shift+Enter to create new lines naturally
  }

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingContent(message.content)
  }

  const handleSaveEdit = () => {
    if (editingMessageId && editingContent.trim()) {
      onEditMessage(editingMessageId, editingContent.trim())
      setEditingMessageId(null)
      setEditingContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  useEffect(() => {
    if (editingMessageId && editTextareaRef.current) {
      editTextareaRef.current.focus()
      editTextareaRef.current.style.height = 'auto'
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`
    }
  }, [editingMessageId])

  useEffect(() => {
    if (editTextareaRef.current && editingContent) {
      editTextareaRef.current.style.height = 'auto'
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`
    }
  }, [editingContent])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {!conversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">Start a new conversation</h2>
              <p>Select a conversation from the sidebar or create a new one</p>
            </div>
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">Start chatting</h2>
              <p>Type a message below to begin</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`group flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="flex flex-col gap-2 max-w-[80%]">
                  {editingMessageId === message.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        ref={editTextareaRef}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="w-full resize-none bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        style={{ minHeight: '44px', maxHeight: '300px' }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Style code blocks
                                code: ({ node, inline, className, children, ...props }: any) => {
                                  return inline ? (
                                    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="block bg-gray-900 p-3 rounded-lg overflow-x-auto text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  )
                                },
                                // Style pre blocks
                                pre: ({ children }: any) => {
                                  return <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>
                                },
                                // Style links
                                a: ({ href, children }: any) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                                    {children}
                                  </a>
                                ),
                                // Style lists
                                ul: ({ children }: any) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                                ol: ({ children }: any) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                                li: ({ children }: any) => <li className="ml-4">{children}</li>,
                                // Style headings
                                h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
                                h2: ({ children }: any) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
                                h3: ({ children }: any) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
                                // Style blockquotes
                                blockquote: ({ children }: any) => (
                                  <blockquote className="border-l-4 border-gray-600 pl-4 my-2 italic text-gray-300">
                                    {children}
                                  </blockquote>
                                ),
                                // Style tables
                                table: ({ children }: any) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full border-collapse border border-gray-600">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }: any) => (
                                  <th className="border border-gray-600 px-3 py-2 bg-gray-700 font-semibold text-left">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }: any) => (
                                  <td className="border border-gray-600 px-3 py-2">
                                    {children}
                                  </td>
                                ),
                                // Style paragraphs
                                p: ({ children }: any) => <p className="my-2">{children}</p>,
                                // Style horizontal rules
                                hr: () => <hr className="my-4 border-gray-600" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        )}
                      </div>
                      {hoveredMessageId === message.id && !isLoading && (
                        <div className={`flex gap-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {message.role === 'user' && (
                            <button
                              onClick={() => handleEditMessage(message)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="Edit message"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => onRegenerateResponse(message.id)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="Regenerate response"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteMessage(message.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-4">
                <div className="bg-gray-800 rounded-lg px-4 py-3">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {conversation && (
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
            {/* Model Selector */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-4">
                <label className="text-gray-400">Model:</label>
                <select
                  value={model}
                  onChange={(e) => onModelChange(e.target.value as Model)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gray-600 min-w-[200px]"
                >
                  {MODELS.map((modelOption) => (
                    <option key={modelOption.id} value={modelOption.id}>
                      {modelOption.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-gray-500">
                {MODELS.find(m => m.id === model)?.description}
              </div>
            </div>
            {/* System Message Input */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!systemMessage}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      onSystemMessageChange('')
                    } else {
                      onSystemMessageChange('You are a helpful assistant. Do not engage in casual conversation. Be direct and concise.')
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Add system message (no-chat mode)</span>
              </label>
            </div>
            {systemMessage && (
              <div className="mb-2">
                <textarea
                  value={systemMessage}
                  onChange={(e) => onSystemMessageChange(e.target.value)}
                  placeholder="System message (e.g., 'Do not engage in casual conversation. Be direct and concise.')"
                  rows={2}
                  className="w-full resize-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 disabled:opacity-50"
                style={{ maxHeight: '200px', minHeight: '44px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
