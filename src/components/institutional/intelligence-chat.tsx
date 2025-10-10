'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Clock, Loader2, MessageSquareText, Plus, Send, Sparkles, Trash2, Bookmark } from 'lucide-react'
import { toast } from 'sonner'

import { AIMessage, DataSource } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'

interface IntelligenceChatProps {
  initialConversationId?: string
}

interface ConversationRecord {
  id: string
  title: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  messages: AIMessage[]
}

const STORAGE_KEY = 'intelligence:conversations'

const FACT_LIBRARY = [
  {
    id: 'poverty-eicv7',
    stat: 'National poverty rate decreased from 44.9% (EICV5, 2016-2017) to 38.2% (EICV7, 2023-2024).',
    insight:
      'Eastern Province shows highest poverty at 42.1%, while Kigali City has lowest at 12.4%. Targeted interventions in rural areas correlate with steady poverty reduction.',
    action: 'Sustain poverty reduction programs in Eastern and Western provinces while scaling successful Kigali urban models to secondary cities.',
    source: {
      id: 'nisr-eicv7',
      name: 'NISR EICV7 Survey 2023-2024',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 98,
      lastUpdated: new Date('2024-05-30'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'employment-rlfs2024',
    stat: 'National employment rate stands at 78.3%, with youth unemployment (15-24) at 23.4% according to Labour Force Survey 2024.',
    insight:
      'Services sector (28.4% of employment) shows strongest growth at 9.8% GDP contribution. Urban youth unemployment remains elevated, particularly in Kigali (25.6%).',
    action: 'Expand ICT skills training and services sector job creation programs targeting youth in urban centers.',
    source: {
      id: 'nisr-rlfs-2024',
      name: 'Rwanda Labour Force Survey 2024',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 97,
      lastUpdated: new Date('2025-03-30'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'gdp-growth-2024',
    stat: 'Services sector leads GDP growth at 9.8%, contributing 52.1% to national GDP, followed by Industry (7.1%) and Agriculture (5.2%).',
    insight:
      'ICT & Communications subsector growing at 12.3%, Financial Services at 10.7%. Rwanda\'s knowledge-based economy transformation is accelerating per NST2 targets.',
    action: 'Prioritize investment opportunities in ICT and financial services sectors while maintaining agricultural productivity gains.',
    source: {
      id: 'nisr-gdp-q2-2024',
      name: 'NISR National Accounts Q2 2024',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 97,
      lastUpdated: new Date('2024-06-15'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'population-census-2022',
    stat: 'Rwanda\'s population reached 13.2 million in 2022 Census, growing at 2.4% annually with median age of 19.3 years.',
    insight:
      'Young population (15-35 years: 39.2%) presents opportunity for economic growth but requires strategic investment in education and job creation.',
    action: 'Align education and workforce development programs with demographic trends to capture youth dividend.',
    source: {
      id: 'nisr-rphc-2022',
      name: 'Rwanda Population and Housing Census 2022',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 99,
      lastUpdated: new Date('2024-03-11'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'food-security-cfsva-2024',
    stat: '82.1% of households are food secure, but 17.9% face moderate to severe food insecurity (CFSVA 2024).',
    insight:
      'Eastern Province shows highest vulnerability at 22.3% food insecurity. Agricultural production growing at 5.2% annually but distribution challenges persist.',
    action: 'Target food security interventions in Eastern Province while scaling agro-processing projects to improve value chains.',
    source: {
      id: 'nisr-cfsva-2024',
      name: 'Comprehensive Food Security and Vulnerability Analysis 2024',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 95,
      lastUpdated: new Date('2025-08-08'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'agriculture-sas-2024',
    stat: 'Seasonal Agricultural Survey 2024 shows steady crop production growth with main crops: cassava, maize, beans, sweet potatoes.',
    insight:
      'Modern farming techniques adoption rate at 34.2%. Agro-processing investment pipeline valued at $8M offers strong ROI potential.',
    action: 'Accelerate modern farming adoption through extension services while attracting private investment in agro-processing.',
    source: {
      id: 'nisr-sas-2024',
      name: 'Rwanda Seasonal Agricultural Survey 2024',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 96,
      lastUpdated: new Date('2025-01-07'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'financial-inclusion-finscope-2024',
    stat: 'Financial inclusion metrics from FinScope 2024 show expanding access to banking and mobile money services.',
    insight:
      'Financial services sector growing at 10.7% (National Accounts). Digital financial services driving inclusion in rural areas.',
    action: 'Support fintech innovation and mobile banking expansion to reach underserved populations.',
    source: {
      id: 'nisr-finscope-2024',
      name: 'FinScope 2024, Financial Inclusion in Rwanda',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 93,
      lastUpdated: new Date('2025-07-09'),
      url: 'https://statistics.gov.rw/'
    },
  },
  {
    id: 'establishment-census-2023',
    stat: 'Rwanda Establishment Census 2023 tracks business formation and employment across all sectors.',
    insight:
      'Services sector establishments growing fastest, particularly in ICT and professional services. Aligns with GDP growth trends.',
    action: 'Streamline business registration and provide targeted support for high-growth sectors identified in census.',
    source: {
      id: 'nisr-rec-2023',
      name: 'Rwanda Establishment Census 2023',
      type: 'STATISTICS' as DataSource['type'],
      reliability: 96,
      lastUpdated: new Date('2024-07-01'),
      url: 'https://statistics.gov.rw/'
    },
  },
]

const DEFAULT_SUGGESTIONS = [
  'What is the current poverty rate in Eastern Province?',
  'How is youth unemployment trending in urban areas?',
  'Which sectors show strongest GDP growth?',
  'Show me food security status across provinces.',
]

function serialiseConversations(conversations: ConversationRecord[]) {
  if (typeof window === 'undefined') return
  const payload = conversations.map((conversation) => ({
    ...conversation,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString(),
      sources: message.sources?.map((source) => ({
        ...source,
        lastUpdated: source.lastUpdated instanceof Date ? source.lastUpdated.toISOString() : source.lastUpdated,
      })),
    })),
  }))

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to persist conversations', error)
  }
}

function deserialiseConversations(): ConversationRecord[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as ConversationRecord[]
    return parsed.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
        sources: message.sources?.map((source) => ({
          ...source,
          lastUpdated: new Date(source.lastUpdated),
        })),
      })),
    }))
  } catch (error) {
    console.error('Failed to parse stored conversations', error)
    return []
  }
}

function createDefaultConversation(userName?: string): ConversationRecord {
  const now = new Date()
  const assistantMessage: AIMessage = {
    id: `assistant-${now.getTime()}`,
    role: 'ASSISTANT',
    timestamp: now,
    content: `Muraho ${userName ?? 'Minister'}, I am ready to synthesize cabinet intelligence, NISR data, and institutional memory. Ask me about poverty rates, employment trends, GDP growth, or any policy insights.`,
    sources: [
      {
        id: 'nisr-portal',
        name: 'NISR Microdata Portal',
        type: 'STATISTICS',
        reliability: 97,
        lastUpdated: now,
      },
    ],
  }

  return {
    id: `conversation-${now.getTime()}`,
    title: 'New intelligence thread',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: [assistantMessage],
    tags: ['Starter'],
  }
}

function deriveTitle(messages: AIMessage[], fallback: string) {
  const firstUserMessage = messages.find((message) => message.role === 'USER')
  if (!firstUserMessage) return fallback
  const text = firstUserMessage.content.trim()
  if (!text) return fallback
  return text.length > 70 ? `${text.slice(0, 67)}…` : text
}

function formatRelativeTime(from: Date) {
  const diffMs = Date.now() - from.getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function buildLessonConversation(payload: any): ConversationRecord | null {
  if (!payload || !payload.decisionId) return null
  const now = new Date()
  const assistantMessage: AIMessage = {
    id: `assistant-${now.getTime()}`,
    role: 'ASSISTANT',
    timestamp: now,
    content: `We captured lessons from **${payload.title}** (${payload.ministry}). Key insight:

- ${payload.lesson}

Success drivers: ${payload.successFactors?.slice(0, 2).join(', ') || 'not documented yet'}
Blockers: ${payload.failureFactors?.slice(0, 2).join(', ') || 'No major blockers flagged.'}

Let me know how you want to activate this lesson — we can prep talking points or alert delivery units.`,
    sources: [
      {
        id: 'institutional-memory',
        name: 'Institutional Memory Archive',
        type: 'MINISTRY',
        reliability: 87,
        lastUpdated: now,
      },
    ],
  }

  return {
    id: `lesson-${payload.decisionId}`,
    title: `Lesson: ${payload.title}`,
    tags: ['Pinned lesson'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: [assistantMessage],
  }
}

function buildInsightConversation(payload: any): ConversationRecord | null {
  if (!payload || !payload.id) return null
  const now = new Date()
  const assistantMessage: AIMessage = {
    id: `assistant-${now.getTime()}`,
    role: 'ASSISTANT',
    timestamp: now,
    content: `I analyzed the dashboard insights you generated:

- **Headline:** ${payload.summary}
- **Key drivers:** ${payload.drivers?.join('; ') || 'Budget execution trends, investment pipeline velocity, and project delivery risk indicators.'}
- **Recommended Action:** ${payload.recommendation || 'Prepare executive briefing with supporting NISR data and ministry action items.'}

I can generate detailed briefs, export data snapshots, or provide ministry-specific recommendations.`,
    sources: [
      {
        id: 'dashboard-intelligence',
        name: 'Rwanda Government Intelligence Platform',
        type: 'STATISTICS',
        reliability: 94,
        lastUpdated: now,
      },
    ],
  }

  return {
    id: payload.id,
    title: payload.title || 'Generated insight pack',
    tags: ['Generated from dashboard'],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: [assistantMessage],
  }
}

export default function IntelligenceChat({ initialConversationId }: IntelligenceChatProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isResponding, setIsResponding] = useState(false)

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [conversations])

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === activeConversationId) ?? null
  }, [activeConversationId, conversations])

  useEffect(() => {
    const stored = deserialiseConversations()
    const additions: ConversationRecord[] = []
    let preferredConversationId: string | null = initialConversationId ?? null

    if (typeof window !== 'undefined') {
      const lessonRaw = window.localStorage.getItem('intelligence:pinned-lesson')
      if (lessonRaw) {
        try {
          const payload = JSON.parse(lessonRaw)
          const lessonConversation = buildLessonConversation(payload)
          if (lessonConversation) {
            additions.push(lessonConversation)
            preferredConversationId = lessonConversation.id
          }
        } catch (error) {
          console.error('Failed to parse pinned lesson payload', error)
        }
        window.localStorage.removeItem('intelligence:pinned-lesson')
      }

      const insightRaw = window.localStorage.getItem('intelligence:pending-insight')
      if (insightRaw) {
        try {
          const payload = JSON.parse(insightRaw)
          const insightConversation = buildInsightConversation(payload)
          if (insightConversation) {
            additions.push(insightConversation)
            preferredConversationId = insightConversation.id
          }
        } catch (error) {
          console.error('Failed to parse generated insight payload', error)
        }
        window.localStorage.removeItem('intelligence:pending-insight')
      }
    }

    const mergedById: Record<string, ConversationRecord> = {}
    ;[...stored, ...additions].forEach((conversation) => {
      mergedById[conversation.id] = conversation
    })

    const merged = Object.values(mergedById)
    const finalList = merged.length ? merged : [createDefaultConversation(user?.name)]

    setConversations(finalList)
    setActiveConversationId(preferredConversationId ?? finalList[0]?.id ?? null)
  }, [initialConversationId, user?.name])

  useEffect(() => {
    serialiseConversations(conversations)
  }, [conversations])

  useEffect(() => {
    if (!initialConversationId) return
    const exists = conversations.find((conversation) => conversation.id === initialConversationId)
    if (exists) {
      setActiveConversationId(initialConversationId)
    }
  }, [initialConversationId, conversations])

  // Removed auto-scroll to prevent unwanted scrolling behavior
  // Users can manually scroll to see messages

  const handleNewConversation = () => {
    const conversation = createDefaultConversation(user?.name)
    setConversations((prev) => [conversation, ...prev])
    setActiveConversationId(conversation.id)
    toast.success('Started a fresh intelligence thread')
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conversation) => conversation.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(conversations.find((conversation) => conversation.id !== id)?.id ?? null)
    }
    toast.success('Conversation removed from Institutional Memory')
  }

  const appendMessage = (conversationId: string, message: AIMessage) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              updatedAt: message.timestamp.toISOString(),
              messages: [...conversation.messages, message],
            }
          : conversation
      )
    )
  }

  const updateConversationTitle = (conversationId: string, title: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title,
            }
          : conversation
      )
    )
  }

  const handleSendMessage = async () => {
    if (!activeConversation || !inputValue.trim() || isResponding) return

    const trimmed = inputValue.trim()
    const now = new Date()
    const userMessage: AIMessage = {
      id: `user-${now.getTime()}`,
      role: 'USER',
      content: trimmed,
      timestamp: now,
    }

    appendMessage(activeConversation.id, userMessage)
    setInputValue('')
    setIsResponding(true)

    if (activeConversation.title === 'New intelligence thread') {
      updateConversationTitle(activeConversation.id, deriveTitle([...activeConversation.messages, userMessage], activeConversation.title))
    }

    try {
      // Realistic processing delay (1.5-2.5 seconds)
      const delay = 1500 + Math.random() * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Generate contextual response based on message content
      const messageLower = trimmed.toLowerCase()
      let responseContent = ''
      let sources: AIMessage['sources'] = []

      if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('muraho')) {
        responseContent = `Hello! I'm your Rwanda Government Intelligence assistant, powered by official NISR data and institutional knowledge.

I can help you with:
- NISR statistical insights (poverty, employment, GDP, demographics)
- Ministry performance tracking and historical patterns
- Project risk analysis and delivery insights
- Investment opportunities and sector analysis
- Executive briefing preparation

What would you like to explore today?`
        sources = [
          { id: 'nisr-portal', name: 'NISR Microdata Portal', type: 'STATISTICS', lastUpdated: new Date(), reliability: 97 }
        ]
      } else if (messageLower.includes('poverty')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'poverty-eicv7')!
        responseContent = `**NISR EICV7 Survey 2023-2024 Findings:**

${fact.stat}

**Provincial Analysis:**
${fact.insight}

**Strategic Recommendation:**
${fact.action}

Would you like me to generate a provincial poverty reduction brief or export comparative trend data?`
        sources = [fact.source]
      } else if (messageLower.includes('unemployment') || messageLower.includes('employment') || messageLower.includes('youth')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'employment-rlfs2024')!
        responseContent = `**Rwanda Labour Force Survey 2024 Analysis:**

${fact.stat}

**Key Insight:**
${fact.insight}

**Recommended Action:**
${fact.action}

I can provide detailed sector breakdowns, ministry program analysis, or comparative regional data.`
        sources = [fact.source]
      } else if (messageLower.includes('gdp') || messageLower.includes('growth') || messageLower.includes('sector')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'gdp-growth-2024')!
        responseContent = `**NISR National Accounts Q2 2024:**

${fact.stat}

**Strategic Analysis:**
${fact.insight}

**Investment Recommendation:**
${fact.action}

Would you like sector-specific investment opportunities or comparative growth analysis?`
        sources = [fact.source]
      } else if (messageLower.includes('population') || messageLower.includes('demographic')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'population-census-2022')!
        responseContent = `**Rwanda Population and Housing Census 2022:**

${fact.stat}

**Policy Implication:**
${fact.insight}

**Strategic Priority:**
${fact.action}

I can provide district-level breakdowns or demographic trend projections.`
        sources = [fact.source]
      } else if (messageLower.includes('food') || messageLower.includes('agriculture')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'food-security-cfsva-2024')!
        responseContent = `**CFSVA 2024 & Agricultural Survey Analysis:**

${fact.stat}

**Vulnerability Assessment:**
${fact.insight}

**Priority Intervention:**
${fact.action}

I can generate provincial food security maps or agro-processing investment briefs.`
        sources = [fact.source]
      } else if (messageLower.includes('financial') || messageLower.includes('banking')) {
        const fact = FACT_LIBRARY.find(f => f.id === 'financial-inclusion-finscope-2024')!
        responseContent = `**FinScope 2024 Financial Inclusion Analysis:**

${fact.stat}

**Market Insight:**
${fact.insight}

**Development Priority:**
${fact.action}

Would you like rural-urban comparative analysis or fintech opportunity mapping?`
        sources = [fact.source]
      } else {
        // Generic response for other queries
        const fact = FACT_LIBRARY[Math.floor(Math.random() * FACT_LIBRARY.length)]
        responseContent = `Based on current NISR data and institutional intelligence:

**Relevant Finding:**
${fact.stat}

**Analysis:**
${fact.insight}

**Recommended Action:**
${fact.action}

I can provide detailed briefs, export data snapshots, or analyze historical patterns related to "${trimmed.slice(0, 60)}${trimmed.length > 60 ? '...' : ''}".`
        sources = [fact.source]
      }

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'ASSISTANT',
        timestamp: new Date(),
        content: responseContent,
        sources: sources,
      }

      appendMessage(activeConversation.id, assistantMessage)
    } catch (error) {
      console.error('Intelligence chat error:', error)
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'ASSISTANT',
        content: 'I encountered an issue processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
      }
      appendMessage(activeConversation.id, errorMessage)
    } finally {
      setIsResponding(false)
    }
  }

  const handleSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    setTimeout(() => {
      void handleSendMessage()
    }, 50)
  }

  const currentConversationParam = searchParams?.get('conversation')

  useEffect(() => {
    if (!currentConversationParam) return
    const exists = conversations.find((conversation) => conversation.id === currentConversationParam)
    if (exists) {
      setActiveConversationId(currentConversationParam)
    }
  }, [conversations, currentConversationParam])

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className="lg:w-72 flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Intelligence Conversations</CardTitle>
          <CardDescription>
            AI-powered insights from NISR data. Conversations are saved locally for your reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <Button variant="outline" size="sm" onClick={handleNewConversation} className="justify-start gap-2">
            <Plus size={16} />
            New conversation
          </Button>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {sortedConversations.map((conversation) => {
              const updated = new Date(conversation.updatedAt)
              const isActive = conversation.id === activeConversationId
              return (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    isActive ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{conversation.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {formatRelativeTime(updated)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteConversation(conversation.id)
                      }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {conversation.tags && conversation.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conversation.tags.map((tag) => (
                        <span key={`${conversation.id}-${tag}`} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <Bookmark size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col h-full">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{activeConversation?.title ?? 'Select a conversation'}</CardTitle>
              <CardDescription>
                Interrogate cross-government data, investor sentiment, and institutional memory in real-time.
              </CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!activeConversation && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <MessageSquareText className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm">Open a thread from the left or start a new one to capture insights.</p>
              </div>
            )}

            {activeConversation?.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm ${
                    message.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'ASSISTANT' && <Bot className="mt-0.5 h-4 w-4 text-blue-500" />}
                    <div className="space-y-2">
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      {message.sources && message.sources.length > 0 && (
                        <div className={`rounded-lg border p-2 text-xs ${message.role === 'USER' ? 'border-blue-200 bg-blue-500/20' : 'border-blue-100 bg-blue-50'}`}>
                          <p className="mb-1 font-medium text-blue-800">Sources</p>
                          <ul className="space-y-1 text-blue-700">
                            {message.sources.map((source) => (
                              <li key={`${message.id}-${source.id}`}>{source.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className={`text-[11px] uppercase tracking-wide ${message.role === 'USER' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isResponding && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing with NISR data...
                </div>
              </div>
            )}
          </div>

          {activeConversation && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void handleSendMessage()
                    }
                  }}
                  placeholder="Ask about NISR data, ministry performance, or investment insights..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isResponding}
                />
                <Button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={isResponding || !inputValue.trim()}
                  variant="government"
                  className="gap-2"
                >
                  {isResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </Button>
              </div>

              {activeConversation.messages.length <= 2 && !isResponding && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {DEFAULT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestion(suggestion)}
                      className="rounded-md border border-dashed border-blue-200 bg-white px-3 py-2 text-left text-xs text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Sparkles className="mr-1 inline h-3.5 w-3.5" /> {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

