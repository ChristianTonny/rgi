'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2, ExternalLink, Sparkles } from 'lucide-react'
import axios from 'axios'

import { debounce, truncateText } from '@/lib/utils'
import { useAuth, buildApiUrl } from '@/lib/auth'
import type { SearchResult } from '@/types'

interface SearchState {
  results: SearchResult[]
  isSearching: boolean
  error?: string
}

interface ApiSearchResult {
  id: string
  doc: {
    appendix: string
    parent: string
    field: string
    key_value: string
    value: string | number
  }
}

interface ApiSearchResponse {
  total: number
  hits: ApiSearchResult[]
}

const MIN_QUERY_LENGTH = 2

const DEMO_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'proj-1',
    title: 'National Infrastructure Upgrade',
    type: 'PROJECT',
    relevance: 1,
    content: 'Modernizing road and bridge infrastructure across all provinces',
    source: {
      id: 'projects-source',
      name: 'Ministry of Infrastructure',
      type: 'PROJECT',
      lastUpdated: new Date(),
      reliability: 95,
    },
    metadata: {},
    createdAt: new Date(),
  },
  {
    id: 'opp-1',
    title: 'Renewable Energy Investment - Solar Parks',
    type: 'OPPORTUNITY',
    relevance: 1,
    content: 'Investment opportunity in 50MW solar park development in Eastern Province',
    source: {
      id: 'opportunities-source',
      name: 'Rwanda Development Board',
      type: 'EXTERNAL',
      lastUpdated: new Date(),
      reliability: 92,
    },
    metadata: {},
    createdAt: new Date(),
  },
  {
    id: 'insight-1',
    title: 'Budget Efficiency Analysis Q4 2024',
    type: 'INSIGHT',
    relevance: 1,
    content: 'Analysis shows 12% improvement in budget utilization across ministries',
    source: {
      id: 'intelligence-source',
      name: 'National Intelligence Dashboard',
      type: 'STATISTICS',
      lastUpdated: new Date(),
      reliability: 90,
    },
    metadata: {},
    createdAt: new Date(),
  },
]

// Function to transform API response to your SearchResult format
const transformApiResult = (apiResult: ApiSearchResult): SearchResult => {
  const { doc } = apiResult
  const title = `${doc.key_value} - ${doc.field}`.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const content = `${doc.appendix}: ${doc.key_value} ${doc.field} is ${doc.value}`
  
  return {
    id: apiResult.id,
    title,
    type: 'DATA', // You can map this based on your needs
    relevance: 1,
    content,
    source: {
      id: 'search-api',
      name: 'Data Catalogue',
      type: 'STATISTICS',
      lastUpdated: new Date(),
      reliability: 85,
    },
    metadata: {
      appendix: doc.appendix,
      parent: doc.parent,
      field: doc.field,
      key_value: doc.key_value,
      value: doc.value
    },
    createdAt: new Date(),
  }
}

export default function GlobalSearch() {
  const { token } = useAuth()
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
          // Use axios instead of fetch
          const response = await axios.get<ApiSearchResponse>(
            `http://192.168.56.1:5000/api/search?q=${encodeURIComponent(nextQuery)}`,
            {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
              timeout: 10000, // 10 second timeout
            }
          )

          const data = response.data

          if (data.hits && Array.isArray(data.hits)) {
            // Transform API results to your application's format
            const transformedResults = data.hits.map(transformApiResult)
            setState({ 
              results: transformedResults, 
              isSearching: false,
              error: transformedResults.length === 0 ? 'No results found' : undefined
            })
          } else {
            setState({ 
              results: [], 
              isSearching: false, 
              error: 'No results found' 
            })
          }
        } catch (searchError) {
          console.error('Search error:', searchError)
          
          // Fallback to demo results if API is unavailable
          const fallbackResults = DEMO_SEARCH_RESULTS.filter(result => 
            result.title.toLowerCase().includes(nextQuery.toLowerCase()) ||
            result.content.toLowerCase().includes(nextQuery.toLowerCase())
          )
          
          setState({
            results: fallbackResults.length > 0 ? fallbackResults : DEMO_SEARCH_RESULTS,
            isSearching: false,
            error: 'Showing demo results while connecting to search service...',
          })
        }
      }, 300),
    [token]
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
      case 'PROJECT':
        params.set('view', 'projects')
        break
      case 'OPPORTUNITY':
        params.set('view', 'opportunities')
        break
      case 'INSIGHT':
      case 'DATA':
        params.set('view', 'intelligence')
        break
      case 'POLICY':
        params.set('view', 'intelligence')
        params.set('memory', 'policy')
        break
      default:
        params.set('view', 'dashboard')
    }

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
          placeholder="Search Rwanda's data..."
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search Rwanda's data"
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 max-h-97 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50"
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
              <span>Start typing to search Rwanda's datasets, statistics, and insights.</span>
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
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-blue-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleNavigate(result)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.content && (
                        <p className="mt-1 text-xs text-gray-500">{truncateText(result.content, 110)}</p>
                      )}
                      {result.metadata && (
                        <div className="mt-1 text-xs text-gray-400">
                          {result.metadata.appendice && (
                            <div>{result.metadata.appendix.replace(/^Table\s*/i, '')}</div>
                          )}
                          {result.metadata.value && (
                            <div>Value: {result.metadata.value}</div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{result.type}</span>
                        <span className="flex items-center gap-1">
                          <ExternalLink size={12} />
                          {result.source?.name ?? 'Data catalogue'}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={16} className="mt-1 text-gray-400 flex-shrink-0" />
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
                params.set('view', 'intelligence')
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