export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export type Model = 
  | 'grok-4-fast' 
  | 'supermind-agent-v1' 
  | 'deepseek' 
  | 'gemini-2.5-pro' 
  | 'gemini-3-flash-preview' 
  | 'gpt-5'

export interface ModelInfo {
  id: Model
  name: string
  description: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  systemMessage?: string
  model?: Model
}
