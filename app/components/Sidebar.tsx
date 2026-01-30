'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, MessageSquare, Settings, Edit2, Check, X } from 'lucide-react'
import { Conversation } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onEditTitle: (id: string, title: string) => void
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onEditTitle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-gray-500 text-sm text-center mt-8">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800/50'
                }`}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (editingId !== conv.id) {
                    onSelectConversation(conv.id)
                  }
                }}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                {editingId === conv.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation()
                          if (editingTitle.trim()) {
                            onEditTitle(conv.id, editingTitle.trim())
                          }
                          setEditingId(null)
                          setEditingTitle('')
                        }
                        if (e.key === 'Escape') {
                          e.stopPropagation()
                          setEditingId(null)
                          setEditingTitle('')
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (editingTitle.trim()) {
                          onEditTitle(conv.id, editingTitle.trim())
                        }
                        setEditingId(null)
                        setEditingTitle('')
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(null)
                        setEditingTitle('')
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm cursor-pointer">{conv.title}</span>
                    {conv.systemMessage && (
                      <Settings size={12} className="flex-shrink-0 text-gray-500" title="Has system message" />
                    )}
                    {hoveredId === conv.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingId(conv.id)
                            setEditingTitle(conv.title)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                          title="Edit title"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteConversation(conv.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                          title="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        <div>Powered by AI Builders</div>
        <div>Model: Grok-4-Fast</div>
      </div>
    </div>
  )
}
