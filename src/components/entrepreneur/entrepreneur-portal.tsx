'use client'

import { useEffect, useState } from 'react'
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

export default function EntrepreneurPortal({ className }: EntrepreneurPortalProps) {
  const { token, user } = useAuth()
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<InvestmentOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    sector: '',
    location: '',
    investmentRange: 'all',
    riskLevel: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<InvestmentOpportunity | null>(null)

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

    // Apply other filters
    if (filters.sector && filters.sector !== '') {
      filtered = filtered.filter(opp => opp.sector === filters.sector)
    }

    if (filters.location && filters.location !== '') {
      filtered = filtered.filter(opp => opp.location.includes(filters.location))
    }

    if (filters.investmentRange && filters.investmentRange !== 'all') {
      const ranges = {
        'small': [0, 100000000],
        'medium': [100000000, 500000000],
        'large': [500000000, Infinity]
      }
      const [min, max] = ranges[filters.investmentRange as keyof typeof ranges] || [0, Infinity]
      filtered = filtered.filter(opp => opp.investmentRange.min >= min && opp.investmentRange.min < max)
    }

    if (filters.riskLevel && filters.riskLevel !== 'all') {
      filtered = filtered.filter(opp => opp.riskAssessment.overall === filters.riskLevel.toUpperCase())
    }

    setFilteredOpportunities(filtered)
  }, [opportunities, filters, searchQuery])

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
            className="flex items-center space-x-2"
            disabled
            title="Advanced filters available after NISR data integration"
          >
            <Filter size={16} />
            <span>Advanced Filter</span>
          </Button>
          <Button
            variant="government"
            className="flex items-center space-x-2"
            disabled
            title="Watchlist feature available after NISR data integration"
          >
            <Star size={16} />
            <span>My Watchlist</span>
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
            
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sectors</option>
                <option value="Financial Technology">FinTech</option>
                <option value="Renewable Energy">Energy</option>
                <option value="Agriculture & Food Processing">Agriculture</option>
                <option value="Healthcare Technology">HealthTech</option>
                <option value="Transportation Technology">Transport</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                <option value="Kigali">Kigali</option>
                <option value="Rural">Rural Areas</option>
                <option value="Eastern">Eastern Province</option>
                <option value="Special Economic Zone">SEZ</option>
              </select>

              <select
                value={filters.investmentRange}
                onChange={(e) => setFilters({ ...filters, investmentRange: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt;100M RWF)</option>
                <option value="medium">Medium (100M-500M RWF)</option>
                <option value="large">Large (&gt;500M RWF)</option>
              </select>

              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
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
                <div className="flex flex-col items-end space-y-1">
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
                <Button
                  size="sm"
                  variant="government"
                  onClick={() => {
                    toast.success('Interest registered', {
                      description: `The team will reach out about ${opportunity.title} within 2 business days.`,
                    })
                  }}
                >
                  Express Interest
                </Button>
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
                sector: '',
                location: '',
                investmentRange: 'all',
                riskLevel: 'all'
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
              <Button className="flex-1" variant="government">
                Express Investment Interest
              </Button>
              <Button className="flex-1" variant="outline">
                Download Prospectus
              </Button>
            </div>
          </div>
        )}

      </DetailModal>
    </div>
  )
}