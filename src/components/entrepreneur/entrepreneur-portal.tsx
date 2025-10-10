'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailModal } from '@/components/ui/detail-modal'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Target, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Star,
  Filter,
  Search,
  Briefcase,
  PieChart,
  BarChart3,
  ArrowUpRight
} from 'lucide-react'
import { InvestmentOpportunity } from '@/types'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

interface EntrepreneurPortalProps {
  className?: string
}

const FILTER_STORAGE_KEY = 'opportunities:filters'
const WATCHLIST_STORAGE_KEY = 'opportunities:watchlist'
const INTERESTS_STORAGE_KEY = 'opportunities:interests'

const SECTOR_OPTIONS = [
  'Financial Technology',
  'Renewable Energy',
  'Agriculture & Food Processing',
  'Healthcare Technology',
  'Transportation Technology'
]

const LOCATION_OPTIONS = ['Kigali', 'Rural Rwanda', 'Eastern Province', 'Kigali Special Economic Zone', 'Kigali City']

const RISK_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const

export default function EntrepreneurPortal({ className }: EntrepreneurPortalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<InvestmentOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    locations: [] as string[],
    riskLevels: [] as string[],
    minInvestment: 0,
    maxInvestment: 1_000_000_000,
    minROI: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<InvestmentOpportunity | null>(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false)
  const [expressOpportunity, setExpressOpportunity] = useState<InvestmentOpportunity | null>(null)
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false)
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false)
  const [interestForm, setInterestForm] = useState({
    fullName: '',
    email: '',
    organization: '',
    investmentAmount: '',
    notes: '',
  })

  const resetInterestForm = () =>
    setInterestForm({ fullName: '', email: '', organization: '', investmentAmount: '', notes: '' })

  const openInterestModal = (opportunity: InvestmentOpportunity | null) => {
    setExpressOpportunity(opportunity)
    resetInterestForm()
    setIsExpressModalOpen(true)
  }

  const handleAnalyzeOpportunity = (opportunity: InvestmentOpportunity) => {
    const insightPayload = {
      id: `opportunity-${opportunity.id}-${Date.now()}`,
      title: `Opportunity analysis: ${opportunity.title}`,
      summary: `${opportunity.sector} opportunity in ${opportunity.location} targeting ROI of ${opportunity.roi.estimated}%`,
      drivers: [
        `Investment range ${formatCurrency(opportunity.investmentRange.min)}-${formatCurrency(opportunity.investmentRange.max)}`,
        `Risk level ${opportunity.riskAssessment.overall}`,
        `Market size ${formatCurrency(opportunity.marketSize)}`,
      ],
      recommendation: 'Review incentives with RDB investment facilitation office and prepare due diligence pack.',
    }

    window.localStorage.setItem('intelligence:pending-insight', JSON.stringify(insightPayload))
    const params = new URLSearchParams(window.location.search)
    params.set('view', 'intelligence')
    params.set('conversation', insightPayload.id)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    toast.success('Sent to intelligence workspace', {
      description: 'AI assistant will pick up the context in the Intelligence tab.',
    })
  }

  const downloadProspectus = (opportunity: InvestmentOpportunity) => {
    const content = `Opportunity Prospectus: ${opportunity.title}\n\nSector: ${opportunity.sector}\nLocation: ${opportunity.location}\nInvestment Range: ${formatCurrency(opportunity.investmentRange.min)} - ${formatCurrency(opportunity.investmentRange.max)}\nExpected ROI: ${opportunity.roi.estimated}% (${opportunity.roi.timeframe})\n\nOverview:\nThis is a mock prospectus for demo purposes summarizing the key rationale for investors.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${opportunity.title.replace(/\s+/g, '_')}_prospectus.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Prospectus prepared', {
      description: 'Mock document downloaded to your device.',
    })
  }

  const handleSubmitInterest = async () => {
    if (!expressOpportunity) return
    if (!interestForm.fullName || !interestForm.email) {
      toast.error('Please add your name and email')
      return
    }

    setIsSubmittingInterest(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const stored = JSON.parse(localStorage.getItem(INTERESTS_STORAGE_KEY) ?? '[]') as any[]
      stored.unshift({
        opportunityId: expressOpportunity.id,
        submittedAt: new Date().toISOString(),
        form: interestForm,
      })
      localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(stored.slice(0, 25)))
    } catch (error) {
      console.error('Failed to persist interest submission', error)
    }

    toast.success('Interest submitted!', {
      description: `Thank you for your interest in ${expressOpportunity.title}. The facilitation team will reach out shortly.`,
    })
    setIsExpressModalOpen(false)
    setExpressOpportunity(null)
    resetInterestForm()
    setIsSubmittingInterest(false)
  }

  // Mock data for opportunities (in production, fetch from API)
  const mockOpportunities: InvestmentOpportunity[] = [
    {
      id: '1',
      title: 'Digital Payment Infrastructure for Rural Markets',
      sector: 'Financial Technology',
      location: 'Rural Rwanda',
      investmentRange: { min: 50000000, max: 200000000 },
      roi: { estimated: 35, timeframe: '3-5 years' },
      marketSize: 850000000,
      competitionLevel: 'LOW',
      regulatoryComplexity: 'MEDIUM',
      riskAssessment: {
        overall: 'MEDIUM',
        factors: {
          regulatory: 'MEDIUM',
          market: 'LOW',
          financial: 'MEDIUM',
          operational: 'HIGH'
        },
        mitigationStrategies: [
          'Partner with established mobile money operators',
          'Implement phased rollout starting with high-adoption areas',
          'Establish strong local technical support network'
        ]
      },
      requirements: [
        'Mobile money integration expertise',
        'Local partnership agreements',
        'Regulatory approval from BNR',
        'Rural market distribution network'
      ],
      incentives: [
        'Tax holiday for first 3 years',
        'Government partnership opportunities',
        'Access to development fund grants',
        'Fast-track licensing process'
      ],
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2024-09-26')
    },
    {
      id: '2',
      title: 'Solar Energy Manufacturing and Distribution Hub',
      sector: 'Renewable Energy',
      location: 'Kigali Special Economic Zone',
      investmentRange: { min: 200000000, max: 800000000 },
      roi: { estimated: 28, timeframe: '5-7 years' },
      marketSize: 1200000000,
      competitionLevel: 'MEDIUM',
      regulatoryComplexity: 'LOW',
      riskAssessment: {
        overall: 'LOW',
        factors: {
          regulatory: 'LOW',
          market: 'MEDIUM',
          financial: 'LOW',
          operational: 'MEDIUM'
        },
        mitigationStrategies: [
          'Leverage government renewable energy commitments',
          'Partner with regional distributors',
          'Diversify product portfolio beyond solar panels'
        ]
      },
      requirements: [
        'Manufacturing technology transfer',
        'Special Economic Zone registration',
        'Environmental impact assessment',
        'Skilled technician training program'
      ],
      incentives: [
        '0% import duty on machinery',
        'Corporate tax rate of 15% (reduced from 30%)',
        'Land lease at preferential rates',
        'Export development support'
      ],
      createdAt: new Date('2024-09-10'),
      updatedAt: new Date('2024-09-25')
    },
    {
      id: '3',
      title: 'Agricultural Processing and Export Facility',
      sector: 'Agriculture & Food Processing',
      location: 'Eastern Province',
      investmentRange: { min: 100000000, max: 400000000 },
      roi: { estimated: 32, timeframe: '4-6 years' },
      marketSize: 650000000,
      competitionLevel: 'LOW',
      regulatoryComplexity: 'LOW',
      riskAssessment: {
        overall: 'LOW',
        factors: {
          regulatory: 'LOW',
          market: 'LOW',
          financial: 'MEDIUM',
          operational: 'MEDIUM'
        },
        mitigationStrategies: [
          'Establish farmer cooperative partnerships',
          'Implement quality control systems early',
          'Secure export market agreements upfront'
        ]
      },
      requirements: [
        'Food safety certification',
        'Export quality standards compliance',
        'Cold chain logistics setup',
        'Farmer supply contract agreements'
      ],
      incentives: [
        'Export promotion grants',
        'Agricultural development fund access',
        'Training and capacity building support',
        'Quality certification assistance'
      ],
      createdAt: new Date('2024-09-20'),
      updatedAt: new Date('2024-09-26')
    },
    {
      id: '4',
      title: 'Digital Healthcare Platform',
      sector: 'Healthcare Technology',
      location: 'Kigali',
      investmentRange: { min: 25000000, max: 150000000 },
      roi: { estimated: 42, timeframe: '2-4 years' },
      marketSize: 320000000,
      competitionLevel: 'MEDIUM',
      regulatoryComplexity: 'HIGH',
      riskAssessment: {
        overall: 'MEDIUM',
        factors: {
          regulatory: 'HIGH',
          market: 'LOW',
          financial: 'LOW',
          operational: 'MEDIUM'
        },
        mitigationStrategies: [
          'Work closely with Ministry of Health on compliance',
          'Start with non-critical health services',
          'Build strong data security and privacy framework'
        ]
      },
      requirements: [
        'Healthcare regulation compliance',
        'Medical device certification',
        'Data protection and privacy systems',
        'Healthcare professional partnerships'
      ],
      incentives: [
        'Healthcare innovation fund grants',
        'Public-private partnership opportunities',
        'Regulatory sandbox participation',
        'Government pilot program access'
      ],
      createdAt: new Date('2024-09-18'),
      updatedAt: new Date('2024-09-24')
    },
    {
      id: '5',
      title: 'Smart Urban Transportation System',
      sector: 'Transportation Technology',
      location: 'Kigali City',
      investmentRange: { min: 300000000, max: 1000000000 },
      roi: { estimated: 25, timeframe: '7-10 years' },
      marketSize: 450000000,
      competitionLevel: 'HIGH',
      regulatoryComplexity: 'HIGH',
      riskAssessment: {
        overall: 'HIGH',
        factors: {
          regulatory: 'HIGH',
          market: 'HIGH',
          financial: 'MEDIUM',
          operational: 'HIGH'
        },
        mitigationStrategies: [
          'Secure government partnership early',
          'Implement pilot program before full rollout',
          'Build local technical expertise'
        ]
      },
      requirements: [
        'Transportation authority licensing',
        'Smart city integration capability',
        'Electric vehicle infrastructure',
        'Mobile payment system integration'
      ],
      incentives: [
        'Urban development partnership',
        'Infrastructure development grants',
        'Carbon credit opportunities',
        'Public transportation integration'
      ],
      createdAt: new Date('2024-09-12'),
      updatedAt: new Date('2024-09-22')
    }
  ]

  // hydrate from query string and storage
  useEffect(() => {
    const params = searchParams
    if (!params) return

    const sectorParam = params.get('sectors')
    const locationParam = params.get('locations')
    const riskParam = params.get('riskLevels')
    const minInvestmentParam = params.get('minInvestment')
    const maxInvestmentParam = params.get('maxInvestment')
    const minROIParam = params.get('minROI')
    const queryParam = params.get('query')
    const watchlistParam = params.get('watchlist')

    setFilters((prev) => ({
      ...prev,
      sectors: sectorParam ? sectorParam.split(',').filter(Boolean) : prev.sectors,
      locations: locationParam ? locationParam.split(',').filter(Boolean) : prev.locations,
      riskLevels: riskParam ? riskParam.split(',').filter(Boolean) : prev.riskLevels,
      minInvestment: minInvestmentParam ? Number(minInvestmentParam) : prev.minInvestment,
      maxInvestment: maxInvestmentParam ? Number(maxInvestmentParam) : prev.maxInvestment,
      minROI: minROIParam ? Number(minROIParam) : prev.minROI,
    }))

    if (queryParam) {
      setSearchQuery(queryParam)
    }
    if (watchlistParam) {
      setShowWatchlistOnly(watchlistParam === 'true')
    }

    try {
      const storedFilters = localStorage.getItem(FILTER_STORAGE_KEY)
      if (storedFilters) {
        const parsed = JSON.parse(storedFilters)
        setFilters((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Failed to parse stored filters', error)
    }

    try {
      const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist))
      }
    } catch (error) {
      console.error('Failed to parse watchlist', error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
    } catch (error) {
      console.error('Failed to save watchlist', error)
    }
  }, [watchlist])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOpportunities(mockOpportunities)
      setFilteredOpportunities(mockOpportunities)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter opportunities based on current filters and search
  useEffect(() => {
    let filtered = opportunities

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.sectors.length) {
      filtered = filtered.filter((opp) => filters.sectors.includes(opp.sector))
    }

    if (filters.locations.length) {
      filtered = filtered.filter((opp) => filters.locations.some((loc) => opp.location.toLowerCase().includes(loc.toLowerCase())))
    }

    filtered = filtered.filter((opp) => {
      const minRange = filters.minInvestment || 0
      const maxRange = filters.maxInvestment || 1_000_000_000
      const minRoi = filters.minROI || 0
      return (
        opp.investmentRange.min >= minRange &&
        opp.investmentRange.max <= maxRange &&
        opp.roi.estimated >= minRoi
      )
    })

    if (filters.riskLevels.length) {
      filtered = filtered.filter((opp) => filters.riskLevels.includes(opp.riskAssessment.overall))
    }

    if (showWatchlistOnly) {
      filtered = filtered.filter((opp) => watchlist.includes(opp.id))
    }

    setFilteredOpportunities(filtered)
  }, [opportunities, filters, searchQuery, showWatchlistOnly, watchlist])

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (filters.sectors.length) params.set('sectors', filters.sectors.join(',')); else params.delete('sectors')
    if (filters.locations.length) params.set('locations', filters.locations.join(',')); else params.delete('locations')
    if (filters.riskLevels.length) params.set('riskLevels', filters.riskLevels.join(',')); else params.delete('riskLevels')
    if (filters.minInvestment) params.set('minInvestment', String(filters.minInvestment)); else params.delete('minInvestment')
    if (filters.maxInvestment && filters.maxInvestment !== 1_000_000_000) params.set('maxInvestment', String(filters.maxInvestment)); else params.delete('maxInvestment')
    if (filters.minROI) params.set('minROI', String(filters.minROI)); else params.delete('minROI')
    if (searchQuery) params.set('query', searchQuery); else params.delete('query')
    params.set('watchlist', String(showWatchlistOnly))

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
    } catch (error) {
      console.error('Failed to persist filters', error)
    }
  }, [filters, searchQuery, showWatchlistOnly, pathname, router, searchParams])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const activeFilterCount = 
    filters.sectors.length + 
    filters.locations.length + 
    filters.riskLevels.length +
    (filters.minInvestment > 0 ? 1 : 0) +
    (filters.maxInvestment < 1_000_000_000 ? 1 : 0) +
    (filters.minROI > 0 ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const clearAllFilters = () => {
    setFilters({
      sectors: [],
      locations: [],
      riskLevels: [],
      minInvestment: 0,
      maxInvestment: 1_000_000_000,
      minROI: 0,
    })
    setSearchQuery('')
    toast.success('Filters cleared')
  }

  const removeSectorFilter = (sector: string) => {
    setFilters(prev => ({ ...prev, sectors: prev.sectors.filter(s => s !== sector) }))
  }

  const removeLocationFilter = (location: string) => {
    setFilters(prev => ({ ...prev, locations: prev.locations.filter(l => l !== location) }))
  }

  const removeRiskFilter = (risk: string) => {
    setFilters(prev => ({ ...prev, riskLevels: prev.riskLevels.filter(r => r !== risk) }))
  }

  const resetInvestmentRange = () => {
    setFilters(prev => ({ ...prev, minInvestment: 0, maxInvestment: 1_000_000_000 }))
  }

  const resetROI = () => {
    setFilters(prev => ({ ...prev, minROI: 0 }))
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600 mt-1">Discover high-potential investment opportunities in Rwanda</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            variant="outline"
            className="flex items-center space-x-2 relative"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter size={16} />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            variant={showWatchlistOnly ? 'government' : 'outline'}
            className="flex items-center space-x-2"
            onClick={() => setShowWatchlistOnly((prev) => !prev)}
          >
            <Star size={16} />
            <span>{showWatchlistOnly ? 'Viewing Watchlist' : 'My Watchlist'}</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => {
              if (!filteredOpportunities.length) {
                toast.error('No opportunities available to export')
                return
              }

              const exportRows = filteredOpportunities.map((opportunity) => ({
                Title: opportunity.title,
                Sector: opportunity.sector,
                Location: opportunity.location,
                Risk: opportunity.riskAssessment.overall,
                InvestmentMin: opportunity.investmentRange.min,
                InvestmentMax: opportunity.investmentRange.max,
              }))

              exportToCSV(exportRows, 'opportunities')
              toast.success('Opportunities exported', {
                description: `Saved ${filteredOpportunities.length} records to CSV`,
              })
            }}
          >
            <Briefcase size={16} />
            <span>Export Pipeline</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {filters.sectors.map((sector) => (
                <button
                  key={`sector-${sector}`}
                  onClick={() => removeSectorFilter(sector)}
                  className="group rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <span>{sector}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                </button>
              ))}
              {filters.locations.map((loc) => (
                <button
                  key={`loc-${loc}`}
                  onClick={() => removeLocationFilter(loc)}
                  className="group rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                  <span>{loc}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                </button>
              ))}
              {filters.riskLevels.map((risk) => (
                <button
                  key={`risk-${risk}`}
                  onClick={() => removeRiskFilter(risk)}
                  className="group rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <span>{risk} risk</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                </button>
              ))}
              {(filters.minInvestment > 0 || filters.maxInvestment < 1_000_000_000) && (
                <button
                  onClick={resetInvestmentRange}
                  className="group rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
                >
                  <span>{formatCurrency(filters.minInvestment)} – {formatCurrency(filters.maxInvestment)}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                </button>
              )}
              {filters.minROI > 0 && (
                <button
                  onClick={resetROI}
                  className="group rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <span>ROI ≥ {filters.minROI}%</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                </button>
              )}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-xl font-bold">{formatNumber(filteredOpportunities.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Market Size</p>
                <p className="text-xl font-bold">
                  {formatCurrency(filteredOpportunities.reduce((sum, opp) => sum + opp.marketSize, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. ROI</p>
                <p className="text-xl font-bold">
                  {formatPercentage(filteredOpportunities.reduce((sum, opp) => sum + opp.roi.estimated, 0) / filteredOpportunities.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Risk</p>
                <p className="text-xl font-bold">
                  {filteredOpportunities.filter(opp => opp.riskAssessment.overall === 'LOW').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{opportunity.sector}</CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWatchlist((prev) =>
                        prev.includes(opportunity.id)
                          ? prev.filter((id) => id !== opportunity.id)
                          : [...prev, opportunity.id]
                      )
                      toast.success(
                        watchlist.includes(opportunity.id)
                          ? 'Removed from watchlist'
                          : 'Added to watchlist',
                        {
                          description: opportunity.title,
                        }
                      )
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${watchlist.includes(opportunity.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'}`}
                  >
                    {watchlist.includes(opportunity.id) ? 'In Watchlist' : 'Add to Watchlist'}
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskAssessment.overall)}`}>
                    {opportunity.riskAssessment.overall} Risk
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(opportunity.competitionLevel)}`}>
                    {opportunity.competitionLevel} Competition
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{opportunity.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Investment Range</p>
                    <p className="font-medium text-sm">
                      {formatCurrency(opportunity.investmentRange.min)} - {formatCurrency(opportunity.investmentRange.max)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected ROI</p>
                    <p className="font-medium text-sm text-green-600">
                      {formatPercentage(opportunity.roi.estimated)} ({opportunity.roi.timeframe})
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Market Size</p>
                  <p className="font-medium text-sm">{formatCurrency(opportunity.marketSize)}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedOpportunity(opportunity)}>
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAnalyzeOpportunity(opportunity)}>
                      Analyze with AI
                  </Button>
                <Button
                  size="sm"
                  variant="government"
                      onClick={() => openInterestModal(opportunity)}
                >
                  Express Interest
                </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find relevant investment opportunities.
            </p>
            <Button variant="government" onClick={() => {
              setSearchQuery('')
              setFilters({
                sectors: [],
                locations: [],
                riskLevels: [],
                minInvestment: 0,
                maxInvestment: 1_000_000_000,
                minROI: 0,
              })
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      <DetailModal
        isOpen={selectedOpportunity !== null}
        onClose={() => setSelectedOpportunity(null)}
        title={selectedOpportunity?.title ?? 'Opportunity Details'}
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Sector</p>
                <p className="text-base text-gray-900">{selectedOpportunity.sector}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Location</p>
                <p className="text-base text-gray-900">{selectedOpportunity.location}</p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase text-blue-900">Investment Range</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(selectedOpportunity.investmentRange.min)} – {formatCurrency(selectedOpportunity.investmentRange.max)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Estimated ROI {selectedOpportunity.roi.estimated}% over {selectedOpportunity.roi.timeframe}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Opportunity Overview</p>
              <p className="mt-2 text-sm text-gray-700">
                {((selectedOpportunity as any)?.description) ?? 'This strategic opportunity aligns with Rwanda’s priority investment agenda and offers strong growth potential for partners ready to scale nationwide.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Risk Level</p>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRiskColor(selectedOpportunity.riskAssessment.overall)}`}
                >
                  {selectedOpportunity.riskAssessment.overall}
                </span>
                <p className="mt-3 text-xs font-medium uppercase text-gray-500">Competition</p>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getCompetitionColor(selectedOpportunity.competitionLevel)}`}
                >
                  {selectedOpportunity.competitionLevel}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Market Snapshot</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  <li>Market Size: {formatCurrency(selectedOpportunity.marketSize ?? 0)}</li>
                  <li>Regulatory Complexity: {selectedOpportunity.regulatoryComplexity}</li>
                </ul>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Requirements</p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {selectedOpportunity.requirements.map((requirement) => (
                  <li key={requirement}>• {requirement}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Government Incentives</p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {selectedOpportunity.incentives.map((incentive) => (
                  <li key={incentive}>• {incentive}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              Contact Rwanda Development Board for detailed documentation and to initiate the due diligence process. Email: partnerships@rdb.rw
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row">
              <Button className="flex-1" variant="government" onClick={() => openInterestModal(selectedOpportunity)}>
                Express Investment Interest
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => downloadProspectus(selectedOpportunity)}>
                Download Prospectus
              </Button>
            </div>
          </div>
        )}

      </DetailModal>

      <DetailModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Advanced Filters"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-2">Sectors</p>
            <div className="flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => {
                const active = filters.sectors.includes(sector)
                return (
                  <button
                    key={sector}
                    className={`rounded-full px-3 py-1 text-xs border ${active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600'}`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        sectors: active ? prev.sectors.filter((item) => item !== sector) : [...prev.sectors, sector],
                      }))
                    }
                  >
                    {sector}
                  </button>
                )
              })}
    </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-2">Locations</p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_OPTIONS.map((location) => {
                const active = filters.locations.includes(location)
                return (
                  <button
                    key={location}
                    className={`rounded-full px-3 py-1 text-xs border ${active ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-200 hover:text-green-600'}`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        locations: active ? prev.locations.filter((item) => item !== location) : [...prev.locations, location],
                      }))
                    }
                  >
                    {location}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-2">Risk Levels</p>
            <div className="flex flex-wrap gap-2">
              {RISK_OPTIONS.map((risk) => {
                const active = filters.riskLevels.includes(risk)
                return (
                  <button
                    key={risk}
                    className={`rounded-full px-3 py-1 text-xs border ${active ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-200 hover:text-amber-600'}`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        riskLevels: active ? prev.riskLevels.filter((item) => item !== risk) : [...prev.riskLevels, risk],
                      }))
                    }
                  >
                    {risk}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-3">Investment Range (RWF)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Minimum</label>
                <input
                  type="range"
                  min={0}
                  max={1_000_000_000}
                  step={25_000_000}
                  value={filters.minInvestment}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minInvestment: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-sm font-medium text-gray-700 mt-1">{formatCurrency(filters.minInvestment)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Maximum</label>
                <input
                  type="range"
                  min={0}
                  max={1_000_000_000}
                  step={25_000_000}
                  value={filters.maxInvestment}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxInvestment: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-sm font-medium text-gray-700 mt-1">{formatCurrency(filters.maxInvestment)}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-2">Minimum ROI (%)</p>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={filters.minROI}
              onChange={(e) => setFilters((prev) => ({ ...prev, minROI: Number(e.target.value) }))}
              className="w-full"
            />
            <p className="text-sm font-medium text-gray-700 mt-1">{filters.minROI}% or higher</p>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  sectors: [],
                  locations: [],
                  riskLevels: [],
                  minInvestment: 0,
                  maxInvestment: 1_000_000_000,
                  minROI: 0,
                })
                setIsFilterModalOpen(false)
              }}
            >
              Reset Filters
            </Button>
            <Button variant="government" onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DetailModal>

      <DetailModal
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
        title={`Express Interest${expressOpportunity ? ` – ${expressOpportunity.title}` : ''}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Full name</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestForm.fullName}
                onChange={(e) => setInterestForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Organization</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestForm.organization}
                onChange={(e) => setInterestForm((prev) => ({ ...prev, organization: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestForm.email}
                onChange={(e) => setInterestForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Indicative investment amount (RWF)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestForm.investmentAmount}
                onChange={(e) => setInterestForm((prev) => ({ ...prev, investmentAmount: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Notes for the investment facilitation team</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              value={interestForm.notes}
              onChange={(e) => setInterestForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExpressModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="government"
              onClick={handleSubmitInterest}
              disabled={isSubmittingInterest}
            >
              {isSubmittingInterest ? 'Submitting...' : 'Submit interest'}
            </Button>
          </div>
        </div>
      </DetailModal>
    </div>
  )
}