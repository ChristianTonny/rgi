'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Search, X, TrendingUp, FileText, Lightbulb, Building2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch search results from Convex
  const searchResults = useQuery(
    api.searchFederated.searchFederated,
    debouncedQuery.trim().length >= 2 ? { q: debouncedQuery, limit: 10 } : 'skip'
  )

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleResultClick = (result: any) => {
    setIsOpen(false)
    setQuery('')

    // Navigate based on type
    if (result.type === 'PROJECT') {
      router.push('/dashboard/projects')
    } else if (result.type === 'OPPORTUNITY') {
      router.push('/dashboard/entrepreneur')
    } else if (result.type === 'INSIGHT' || result.type === 'DATA') {
      router.push('/dashboard')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'OPPORTUNITY':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'INSIGHT':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'DATA':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return 'Project'
      case 'OPPORTUNITY':
        return 'Opportunity'
      case 'INSIGHT':
        return 'Insight'
      case 'DATA':
        return 'Data'
      default:
        return type
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects, opportunities, insights..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20 w-full md:w-96"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setDebouncedQuery('')
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <Card className="absolute top-full mt-2 w-full md:w-96 z-50 max-h-96 overflow-auto shadow-lg">
          <CardContent className="p-0">
            {searchResults === undefined && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {searchResults && searchResults.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="divide-y">
                {searchResults.map((result: any) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 hover:bg-accent transition-colors flex items-start gap-3"
                  >
                    <div className="mt-0.5">{getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{result.title}</span>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-secondary rounded">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      )}
                      {result.metadata && (
                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                          {result.metadata.sector && <span>• {result.metadata.sector}</span>}
                          {result.metadata.location && <span>• {result.metadata.location}</span>}
                          {result.metadata.status && <span>• {result.metadata.status}</span>}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
