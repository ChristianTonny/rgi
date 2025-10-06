'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth, buildApiUrl } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  User, 
  Bot, 
  Lightbulb,
  ExternalLink 
} from 'lucide-react'
import { AIMessage } from '@/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load suggestions when component mounts
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!token) return

      try {
        const response = await fetch(buildApiUrl('/api/ai/suggestions'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.data)
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      }
    }

    if (isOpen) {
      loadSuggestions()
    }
  }, [isOpen, token])

  const sendMessage = async (message: string) => {
    if (!message.trim() || !token) return

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(buildApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      })

      // Handle invalid/expired token
      if (response.status === 403 || response.status === 401) {
        localStorage.removeItem('gov-auth-token')
        localStorage.removeItem('gov-auth-user')
        window.location.href = '/login'
        return
      }

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: AIMessage = {
          ...data.data,
          timestamp: data?.data?.timestamp ? new Date(data.data.timestamp) : new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
        // Persist usage metrics if provided by backend
        try {
          const usage = (data?.data as any)?.usage
          if (usage) {
            const storedRaw = localStorage.getItem('ai-usage')
            const stored = storedRaw ? JSON.parse(storedRaw) : { totalInput: 0, totalOutput: 0, total: 0, requests: 0, byDay: {} }
            const input = usage.inputTokens || usage.input_tokens || 0
            const output = usage.outputTokens || usage.output_tokens || 0
            const total = usage.totalTokens || usage.total_tokens || input + output
            stored.totalInput += input
            stored.totalOutput += output
            stored.total += total
            stored.requests += 1
            const dayKey = new Date().toISOString().slice(0,10)
            stored.byDay[dayKey] = stored.byDay[dayKey] || { input: 0, output: 0, total: 0, requests: 0 }
            stored.byDay[dayKey].input += input
            stored.byDay[dayKey].output += output
            stored.byDay[dayKey].total += total
            stored.byDay[dayKey].requests += 1
            localStorage.setItem('ai-usage', JSON.stringify(stored))
          }
        } catch {}
      } else {
        let serverMsg = 'Failed to get AI response'
        try {
          const err = await response.json()
          if (err?.message) serverMsg = err.message + (err?.reason ? ` (${err.reason})` : '')
        } catch {}
        throw new Error(serverMsg)
      }
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'ASSISTANT',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const useSuggestion = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const clearConversation = () => {
    setMessages([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 bg-black/50">
      <Card className="w-full max-w-md h-[640px] sm:h-[680px] flex flex-col shadow-2xl bg-white">
        <CardHeader className="flex-shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">AI Assistant</CardTitle>
                <CardDescription className="hidden sm:block">Rwanda Government Intelligence</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close AI Assistant">
              <X size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Hello {user?.name}!</p>
                <p className="text-sm">I'm your government intelligence assistant. How can I help you today?</p>
                {suggestions.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Lightbulb size={12} />
                      <span>Suggested questions:</span>
                    </div>
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="block w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'ASSISTANT' && (
                      <Bot size={16} className="mt-1 text-blue-600" />
                    )}
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Sources:</p>
                          {message.sources.map((source, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs">
                              <ExternalLink size={10} className="text-blue-600" />
                              {source.url ? (
                                <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                  {source.name}
                                </a>
                              ) : (
                                <span className="text-gray-700">{source.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.timestamp as unknown as string).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'USER' && (
                      <User size={16} className="mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-blue-600" />
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t px-3 sm:px-4 py-3 sticky bottom-0 bg-white">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about Rwanda's data..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={false}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputMessage.trim() || isLoading}
                variant="government"
              >
                <Send size={16} />
              </Button>
            </form>
            {messages.length > 0 && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">{messages.length} messages</span>
                <Button variant="ghost" size="sm" onClick={clearConversation} className="text-xs">Clear chat</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}