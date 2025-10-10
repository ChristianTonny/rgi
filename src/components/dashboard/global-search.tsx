'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2, ExternalLink, Sparkles, ArrowUpRight } from 'lucide-react'

import { debounce, truncateText, formatNumber, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import type { SearchResult } from '@/types'

interface SearchState {
  results: SearchResult[]
  isSearching: boolean
  error?: string
}

const MIN_QUERY_LENGTH = 2

const DEMO_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'proj-1',
    title: 'National Infrastructure Upgrade',
    type: 'PROJECT',
    relevance: 1,
    content: 'Modernising corridors in the Eastern province to improve export logistics and reduce travel time.',
    source: {
      id: 'projects-source',
      name: 'Ministry of Infrastructure Portfolio',
      type: 'PROJECT',
      lastUpdated: new Date('2025-09-15T07:30:00Z'),
      reliability: 95,
    },
    metadata: {
      budget: 2400000000,
      status: 'AT RISK',
      focus: 'Road & bridge resiliency programme',
    },
    createdAt: new Date('2025-07-01'),
  },
  {
    id: 'proj-2',
    title: 'Rapid Bus Transit – Kigali Smart Mobility',
    type: 'PROJECT',
    relevance: 0.92,
    content: 'Deploying smart ticketing, electric buses, and dedicated lanes to ease congestion.',
    source: {
      id: 'mov-smart',
      name: 'City of Kigali Delivery Unit',
      type: 'PROJECT',
      lastUpdated: new Date('2025-09-12T08:45:00Z'),
      reliability: 88,
    },
    metadata: {
      budget: 1650000000,
      status: 'DELAYED',
      focus: 'Mobility transformation',
    },
    createdAt: new Date('2025-05-09'),
  },
  {
    id: 'opp-1',
    title: 'Renewable Energy Investment – Eastern Solar Parks',
    type: 'OPPORTUNITY',
    relevance: 0.89,
    content: 'RF 320B blended finance opportunity for 50MW solar and storage projects in Nyagatare.',
    source: {
      id: 'opportunities-source',
      name: 'Rwanda Development Board Investor Desk',
      type: 'EXTERNAL',
      lastUpdated: new Date('2025-09-10T09:10:00Z'),
      reliability: 92,
    },
    metadata: {
      sector: 'Energy',
      value: 320000000000,
      stage: 'Negotiation',
    },
    createdAt: new Date('2025-08-20'),
  },
  {
    id: 'opp-2',
    title: 'Agro-Processing Export Hub – Eastern Province',
    type: 'OPPORTUNITY',
    relevance: 0.84,
    content: 'Cold chain and value-add processing hub targeting horticulture exports to the EAC bloc.',
    source: {
      id: 'rdb-agri',
      name: 'Investment Facilitation Office',
      type: 'EXTERNAL',
      lastUpdated: new Date('2025-09-08T16:02:00Z'),
      reliability: 90,
    },
    metadata: {
      sector: 'Agriculture',
      value: 210000000000,
      stage: 'Investor Outreach',
    },
    createdAt: new Date('2025-08-06'),
  },
  {
    id: 'insight-1',
    title: 'Budget Efficiency – Cabinet Brief Q3 2025',
    type: 'INSIGHT',
    relevance: 0.82,
    content: 'National execution reached 87.5%. Youth skilling and rural electrification absorb best.',
    source: {
      id: 'intelligence-source',
      name: 'National Intelligence Dashboard',
      type: 'STATISTICS',
      lastUpdated: new Date('2025-09-15T06:15:00Z'),
      reliability: 91,
    },
    metadata: {
      highlight: 'Efficiency trending upward 3 quarters in a row',
      drivers: ['ICT skilling', 'Precision agriculture'],
    },
    createdAt: new Date('2025-09-15'),
  },
  {
    id: 'insight-2',
    title: 'Youth Employment Pulse – LFS Q2 2025',
    type: 'DATA',
    relevance: 0.78,
    content: 'Youth unemployment eased to 21.4%. Kigali innovation apprenticeships are outperforming baseline.',
    source: {
      id: 'nisr-lfs',
      name: 'NISR Labour Force Survey',
      type: 'STATISTICS',
      lastUpdated: new Date('2025-07-28T12:00:00Z'),
      reliability: 94,
    },
    metadata: {
      indicator: 'Youth unemployment',
      value: 21.4,
      trend: 'Improving',
    },
    createdAt: new Date('2025-07-29'),
  },
  {
    id: 'policy-1',
    title: 'Digital Rwanda 2028 Roadmap',
    type: 'POLICY',
    relevance: 0.74,
    content: 'Cabinet-approved roadmap aligning digital infrastructure, talent, and governance with Vision 2050.',
    source: {
      id: 'policy-room',
      name: 'Cabinet Secretariat',
      type: 'MINISTRY',
      lastUpdated: new Date('2025-09-01T10:00:00Z'),
      reliability: 89,
    },
    metadata: {
      status: 'Approved',
      owner: 'Ministry of ICT & Innovation',
    },
    createdAt: new Date('2025-09-01'),
  },
]

export default function GlobalSearch() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [{ results, isSearching, error }, setState] = useState<SearchState>({
    results: [],
    isSearching: false,
  })
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const runSearch = useMemo(
    () =>
      debounce(async (nextQuery: string) => {
        setDebouncedQuery(nextQuery)

        if (!nextQuery.trim() || nextQuery.trim().length < MIN_QUERY_LENGTH) {
          setState({ results: [], isSearching: false })
          return
        }

        setState((prev) => ({ ...prev, isSearching: true, error: undefined }))

        try {
          await new Promise((resolve) => setTimeout(resolve, 280))

          const lowerQuery = nextQuery.toLowerCase()
          const fallbackResults = DEMO_SEARCH_RESULTS.filter((result) => {
            return (
              result.title.toLowerCase().includes(lowerQuery) ||
              result.content.toLowerCase().includes(lowerQuery) ||
              Object.values(result.metadata ?? {}).some((value) =>
                typeof value === 'string' ? value.toLowerCase().includes(lowerQuery) : false
              )
            )
          })

          setState({
            results: fallbackResults.length > 0 ? fallbackResults : DEMO_SEARCH_RESULTS,
            isSearching: false,
            error: undefined,
          })
        } catch (searchError) {
          console.error('Search error:', searchError)
          setState({
            results: DEMO_SEARCH_RESULTS,
            isSearching: false,
            error: 'Showing demo results',
          })
        }
      }, 300),
    []
  )

  useEffect(() => {
    if (!query) {
      setState({ results: [], isSearching: false })
      return
    }

    runSearch(query)
  }, [query, runSearch])

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      setState({ results: [], isSearching: false })
    }
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleNavigate = (result: SearchResult) => {
    setIsOpen(false)

    const params = new URLSearchParams(searchParams?.toString() ?? '')

    if (result.type !== 'POLICY') {
      params.delete('memory')
    }

    switch (result.type) {
      case 'PROJECT': {
        params.set('view', 'projects')
        params.set('focus', result.id)
        break
      }
      case 'OPPORTUNITY': {
        params.set('view', 'opportunities')
        params.set('opportunity', result.id)
        break
      }
      case 'INSIGHT':
      case 'DATA': {
        params.set('view', 'intelligence')
        params.set('conversation', result.id)
        window.localStorage.setItem(
          'intelligence:pending-insight',
          JSON.stringify({
            id: result.id,
            title: result.title,
            summary: result.content,
            drivers: result.metadata?.drivers ?? ['Budget execution', 'Opportunity velocity'],
            recommendation: 'Share with delivery unit and schedule a cabinet check-in.',
          })
        )
        break
      }
      case 'POLICY': {
        params.set('view', 'intelligence')
        params.set('memory', 'policy')
        break
      }
      default: {
        params.set('view', 'dashboard')
      }
    }

    params.set('query', result.title)

    const nextUrl = `${pathname}?${params.toString()}`
    const currentUrl = `${pathname}?${searchParams?.toString() ?? ''}`
    if (nextUrl === currentUrl) return

    router.replace(nextUrl, { scroll: false })
  }

  const showHelperState = query.length < MIN_QUERY_LENGTH && !isSearching && !results.length

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Rwanda's intelligence..."
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search Rwanda's data"
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 max-h-98 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50"
        >
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Searching datasets…
            </div>
          )}

          {!isSearching && error && (
            <div className="px-4 py-3 text-sm text-red-600">
              {error}
              {error.includes('demo') && (
                <div className="mt-1 text-xs text-gray-500">
                  Real search service: 
                </div>
              )}
            </div>
          )}

          {!isSearching && !error && showHelperState && (
            <div className="flex items-start gap-2 px-4 py-3 text-sm text-gray-500">
              <Sparkles className="mt-0.5 h-4 w-4 text-blue-500" />
              <span>Search across cabinet briefs, NISR datasets, projects, and investment leads.</span>
            </div>
          )}

          {!isSearching && !error && results.length === 0 && query.length >= MIN_QUERY_LENGTH && (
            <div className="px-4 py-3 text-sm text-gray-500">No results found. Try a different query.</div>
          )}

          {!isSearching && !error && results.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleNavigate(result)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{result.type}</span>
                        <p className="font-medium text-gray-900">{result.title}</p>
                      </div>
                      {result.content && (
                        <p className="mt-1 text-xs text-gray-600">{truncateText(result.content, 120)}</p>
                      )}
                      {result.metadata && (
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
                          {'budget' in result.metadata && (
                            <span>Budget: {formatCurrency(result.metadata.budget as number)}</span>
                          )}
                          {'status' in result.metadata && <span>Status: {String(result.metadata.status)}</span>}
                          {'focus' in result.metadata && <span>Focus: {String(result.metadata.focus)}</span>}
                          {'sector' in result.metadata && <span>Sector: {String(result.metadata.sector)}</span>}
                          {'value' in result.metadata && (
                            <span>Value: {formatCurrency(result.metadata.value as number)}</span>
                          )}
                          {'stage' in result.metadata && <span>Stage: {String(result.metadata.stage)}</span>}
                          {'indicator' in result.metadata && (
                            <span>
                              Indicator: {String(result.metadata.indicator)} – {formatNumber(result.metadata.value as number)}%
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                        {result.source?.name && (
                          <span className="flex items-center gap-1">
                            <ExternalLink size={11} />
                            {result.source.name}
                          </span>
                        )}
                        <span>Updated {result.source?.lastUpdated?.toLocaleDateString?.('en-GB') ?? 'recently'}</span>
                        <span>{Math.round(result.relevance * 100)}% match</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="mt-1 text-gray-400 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && results.length > 0 && (
            <button
              type="button"
              className="block w-full rounded-b-lg bg-gray-50 px-4 py-2 text-left text-xs font-medium text-blue-600 hover:bg-gray-100"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setIsOpen(false)
                const params = new URLSearchParams(searchParams?.toString() ?? '')
               // params.set('view', 'intelligence')
                params.set('query', query)
                const nextUrl = `${pathname}?${params.toString()}`
                const currentUrl = `${pathname}?${searchParams?.toString() ?? ''}`
                if (nextUrl === currentUrl) return
                router.replace(nextUrl, { scroll: false })
              }}
            >
              View advanced search
            </button>
          )}
        </div>
      )}
    </div>
  )
}