'use client'

import { useEffect, useState, useRef } from 'react'
import { buildApiUrl, useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Plus, Trash2, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
  createdAt: string
}

interface Conversation {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  isArchived: boolean
  context?: any
  messages?: Message[]
}

interface ChatViewProps {
  className?: string
}

export default function ChatView({ className }: ChatViewProps) {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch active conversation messages
  useEffect(() => {
    if (activeConversation) {
      fetchConversationMessages(activeConversation.id)
    }
  }, [activeConversation?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    if (!token) return

    try {
      const response = await fetch(buildApiUrl('/api/conversations'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch conversations')

      const data = await response.json()
      if (data.success) {
        setConversations(data.data || [])
        // Select first conversation if available
        if (data.data && data.data.length > 0 && !activeConversation) {
          setActiveConversation(data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch(buildApiUrl(`/api/conversations/${conversationId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch messages')

      const data = await response.json()
      if (data.success) {
        setMessages(data.data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    if (!token) return

    try {
      const response = await fetch(buildApiUrl('/api/conversations'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Conversation',
          initialMessage: 'Hello! I need help analyzing government data.'
        })
      })

      if (!response.ok) throw new Error('Failed to create conversation')

      const data = await response.json()
      if (data.success) {
        await fetchConversations()
        setActiveConversation(data.data)
        toast.success('New conversation created')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation || !token) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    try {
      const response = await fetch(
        buildApiUrl(`/api/conversations/${activeConversation.id}/messages`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: userMessage,
            role: 'user'
          })
        }
      )

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      if (data.success) {
        // Add user message immediately
        setMessages(prev => [...prev, data.data])

        // Poll for AI response
        setTimeout(() => {
          fetchConversationMessages(activeConversation.id)
        }, 1000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!token) return

    try {
      const response = await fetch(buildApiUrl(`/api/conversations/${conversationId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      toast.success('Conversation deleted')
      await fetchConversations()
      
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  return (
    <div className={`flex h-[calc(100vh-200px)] ${className}`}>
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet. Click "New Conversation" to start.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">or create a new one to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">{activeConversation.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Started {formatDistanceToNow(new Date(activeConversation.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation below.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader2 className="animate-spin text-gray-400" size={16} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="px-4"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
