'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  History, 
  TrendingUp, 
  TrendingDown,
  BookOpen, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  Archive,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Clock,
  Target
} from 'lucide-react'
import { DetailModal } from '@/components/ui/detail-modal'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

interface PolicyDecision {
  id: string
  title: string
  description: string
  category: string
  ministry: string
  decisionMaker: string
  decisionDate: string
  isSuccessful: boolean | null
  rationale: string
  expectedOutcomes: string[]
  actualOutcomes: string[]
  lessonsLearned: string
  successFactors: string[]
  failureFactors: string[]
}

interface HistoricalPattern {
  id: string
  patternType: string
  description: string
  context: Record<string, any>
  outcomes: Record<string, any>
  confidenceScore: number
  supportingEvidence: string[]
  frequency: number
  lastOccurrence: string
}

export default function InstitutionalMemory() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('decisions')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filteredDecisions, setFilteredDecisions] = useState<PolicyDecision[]>([])
  const [filteredPatterns, setFilteredPatterns] = useState<HistoricalPattern[]>([])
  const [selectedDecision, setSelectedDecision] = useState<PolicyDecision | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<HistoricalPattern | null>(null)

  // Mock data for demonstration
  const mockPolicyDecisions: PolicyDecision[] = [
    {
      id: '1',
      title: 'Digital Rwanda 2020 Strategy',
      description: 'Comprehensive national ICT strategy aimed at transforming Rwanda into a knowledge-based economy',
      category: 'Technology Policy',
      ministry: 'ICT and Innovation',
      decisionMaker: 'Cabinet',
      decisionDate: '2020-01-15',
      isSuccessful: true,
      rationale: 'To accelerate digital transformation and position Rwanda as a regional technology hub',
      expectedOutcomes: [
        'Increase ICT contribution to GDP by 20%',
        'Create 100,000 technology jobs',
        'Achieve 95% internet penetration',
        'Establish Kigali as regional fintech hub'
      ],
      actualOutcomes: [
        'ICT contribution to GDP increased by 18%',
        '85,000 technology jobs created',
        '89% internet penetration achieved',
        'Kigali recognized as leading African fintech center'
      ],
      lessonsLearned: 'Strong government commitment and private sector partnership essential for digital transformation success',
      successFactors: [
        'Clear vision and leadership',
        'Public-private partnerships',
        'Investment in digital infrastructure',
        'Skills development programs',
        'Regulatory framework modernization'
      ],
      failureFactors: []
    },
    {
      id: '2',
      title: 'Plastic Ban Implementation',
      description: 'Complete ban on single-use plastic bags and non-biodegradable packaging',
      category: 'Environmental Policy',
      ministry: 'Environment',
      decisionMaker: 'Parliament',
      decisionDate: '2019-01-01',
      isSuccessful: true,
      rationale: 'Address environmental degradation and promote sustainable development practices',
      expectedOutcomes: [
        'Reduce plastic waste by 90%',
        'Improve environmental cleanliness',
        'Create green jobs in alternative packaging',
        'Enhance Rwanda\'s environmental reputation'
      ],
      actualOutcomes: [
        'Plastic waste reduced by 85%',
        'Significant improvement in urban cleanliness',
        '15,000 green jobs created',
        'Rwanda recognized as environmental leader in Africa'
      ],
      lessonsLearned: 'Strong enforcement mechanisms and alternative solutions essential for environmental policy success',
      successFactors: [
        'Clear enforcement mechanisms',
        'Public awareness campaigns',
        'Alternative solutions provided',
        'Cross-border coordination',
        'Business community engagement'
      ],
      failureFactors: []
    },
    {
      id: '3',
      title: 'Universal Health Insurance (Mutuelle de Santé)',
      description: 'Mandatory health insurance scheme covering all Rwandan citizens',
      category: 'Health Policy',
      ministry: 'Health',
      decisionMaker: 'Government',
      decisionDate: '2019-07-01',
      isSuccessful: true,
      rationale: 'Ensure universal healthcare access and reduce out-of-pocket medical expenses',
      expectedOutcomes: [
        'Achieve 95% population coverage',
        'Reduce infant mortality by 30%',
        'Decrease medical bankruptcies by 80%',
        'Improve overall health indicators'
      ],
      actualOutcomes: [
        '97% population coverage achieved',
        'Infant mortality reduced by 28%',
        'Medical bankruptcies reduced by 75%',
        'Significant improvement in health outcomes'
      ],
      lessonsLearned: 'Community-based healthcare delivery models can achieve universal coverage in resource-constrained settings',
      successFactors: [
        'Community-based implementation',
        'Affordable premium structure',
        'Strong primary healthcare system',
        'Technology integration for efficiency',
        'Political commitment and funding'
      ],
      failureFactors: []
    },
    {
      id: '4',
      title: 'One Laptop Per Child (OLPC) Program',
      description: 'Initiative to provide laptops to all primary school children',
      category: 'Education Policy',
      ministry: 'Education',
      decisionMaker: 'Ministry of Education',
      decisionDate: '2018-08-01',
      isSuccessful: false,
      rationale: 'Bridge digital divide and enhance learning outcomes through technology integration',
      expectedOutcomes: [
        'Improve digital literacy rates',
        'Enhance student engagement',
        'Reduce educational inequality',
        'Prepare students for digital economy'
      ],
      actualOutcomes: [
        'Limited impact on learning outcomes',
        'High maintenance costs',
        'Teacher training challenges',
        'Infrastructure limitations in rural areas'
      ],
      lessonsLearned: 'Technology initiatives require comprehensive ecosystem including infrastructure, training, and content development',
      successFactors: [],
      failureFactors: [
        'Insufficient teacher training',
        'Limited electricity in rural schools',
        'Lack of relevant local content',
        'High maintenance and replacement costs',
        'Limited technical support infrastructure'
      ]
    }
  ]

  const mockHistoricalPatterns: HistoricalPattern[] = [
    {
      id: '1',
      patternType: 'Policy Implementation Success',
      description: 'Policies with strong enforcement mechanisms and public-private partnerships show 85% higher success rates',
      context: {
        enforcementMechanism: 'Strong',
        publicPrivatePartnership: true,
        budgetAllocation: 'Adequate',
        politicalSupport: 'High'
      },
      outcomes: {
        successRate: 85,
        implementationTime: 18,
        publicSatisfaction: 78
      },
      confidenceScore: 0.92,
      supportingEvidence: [
        'Digital Rwanda 2020 Strategy',
        'Plastic Ban Implementation',
        'Universal Health Insurance',
        'Kigali Master Plan Implementation'
      ],
      frequency: 12,
      lastOccurrence: '2024-06-15'
    },
    {
      id: '2',
      patternType: 'Technology Adoption Challenges',
      description: 'Technology-focused initiatives without adequate infrastructure and training show 70% failure rate',
      context: {
        infrastructureReadiness: 'Poor',
        trainingProvided: false,
        localContent: 'Limited',
        technicalSupport: 'Insufficient'
      },
      outcomes: {
        successRate: 30,
        adoptionRate: 25,
        sustainabilityScore: 20
      },
      confidenceScore: 0.78,
      supportingEvidence: [
        'One Laptop Per Child Program',
        'Rural E-Government Rollout',
        'Digital Agriculture Platform',
        'Telemedicine Initiative'
      ],
      frequency: 8,
      lastOccurrence: '2024-03-22'
    },
    {
      id: '3',
      patternType: 'Community-Based Implementation Success',
      description: 'Programs implemented through community structures achieve 90% higher adoption rates',
      context: {
        communityInvolvement: 'High',
        localLeadership: 'Engaged',
        culturalAlignment: 'Strong',
        feedbackMechanisms: 'Established'
      },
      outcomes: {
        adoptionRate: 90,
        sustainabilityScore: 85,
        communityOwnership: 95
      },
      confidenceScore: 0.88,
      supportingEvidence: [
        'Mutuelle de Santé (Health Insurance)',
        'Cooperative Development Programs',
        'Community Policing Initiative',
        'Environmental Protection Programs'
      ],
      frequency: 15,
      lastOccurrence: '2024-08-10'
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setFilteredDecisions(mockPolicyDecisions)
      setFilteredPatterns(mockHistoricalPatterns)
    }, 750)
  }, [])

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) {
      setFilteredDecisions(mockPolicyDecisions)
      setFilteredPatterns(mockHistoricalPatterns)
      return
    }

    const decisions = mockPolicyDecisions.filter((decision) => {
      return (
        decision.title.toLowerCase().includes(query) ||
        decision.description.toLowerCase().includes(query) ||
        decision.ministry.toLowerCase().includes(query) ||
        decision.category.toLowerCase().includes(query)
      )
    })

    const patterns = mockHistoricalPatterns.filter((pattern) =>
      pattern.patternType.toLowerCase().includes(query) ||
      pattern.description.toLowerCase().includes(query)
    )

    setFilteredDecisions(decisions)
    setFilteredPatterns(patterns)
  }, [searchQuery])

  const getSuccessIcon = (isSuccessful: boolean | null) => {
    if (isSuccessful === true) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (isSuccessful === false) return <XCircle className="h-5 w-5 text-red-600" />
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  const getSuccessColor = (isSuccessful: boolean | null) => {
    if (isSuccessful === true) return 'text-green-600 bg-green-100'
    if (isSuccessful === false) return 'text-red-600 bg-red-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institutional Memory</h1>
          <p className="text-gray-600 mt-1">Historical patterns and lessons learned from government initiatives</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => {
                  const exportRows = filteredDecisions.map((decision) => ({
                    Title: decision.title,
                    Ministry: decision.ministry,
                    DecisionDate: decision.decisionDate,
                    Status:
                      decision.isSuccessful === true
                        ? 'Success'
                        : decision.isSuccessful === false
                        ? 'Failed'
                        : 'Ongoing',
                  }))

                  exportToCSV(exportRows, 'institutional_memory_decisions')
                  toast.success('Institutional memory exported', {
                    description: `Saved ${exportRows.length} decisions to CSV`,
                  })
                }}
              >
            <Archive size={16} />
            <span>Export Report</span>
          </Button>
          <Button
            variant="government"
            className="flex items-center space-x-2"
            onClick={() => {
              toast.success('Insight generation started', {
                description: 'Analyzing historical patterns and lessons for your ministry.',
              })
              setTimeout(() => {
                toast.info('New insights ready', {
                  description: 'AI summary prepared for the Intelligence team.',
                })
              }, 2500)
            }}
          >
            <Lightbulb size={16} />
            <span>Generate Insights</span>
          </Button>
        </div>
      </div>

      {/* Search and Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'decisions'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Policy Decisions
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'patterns'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Historical Patterns
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search institutional memory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Advanced filters available after NISR data integration"
              >
                <Filter size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'decisions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDecisions.map((decision) => (
            <Card key={decision.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{decision.title}</CardTitle>
                    <CardDescription className="mt-1">{decision.category} • {decision.ministry}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSuccessIcon(decision.isSuccessful)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSuccessColor(decision.isSuccessful)}`}>
                      {decision.isSuccessful === true ? 'Success' : decision.isSuccessful === false ? 'Failed' : 'Ongoing'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{decision.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{decision.decisionDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{decision.decisionMaker}</span>
                    </div>
                  </div>

                  {decision.lessonsLearned && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Key Lesson</span>
                      </div>
                      <p className="text-sm text-blue-800">{decision.lessonsLearned}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDecision(decision)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="government"
                      onClick={() =>
                        toast.success('Lesson flagged for application', {
                          description: `Added to action plan for ${decision.ministry}.`,
                        })
                      }
                    >
                      Apply Lessons
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {filteredPatterns.map((pattern) => (
            <Card key={pattern.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pattern.patternType}</CardTitle>
                    <CardDescription className="mt-1">{pattern.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(pattern.confidenceScore)}`}>
                      {Math.round(pattern.confidenceScore * 100)}% Confidence
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Context Factors</h4>
                    <div className="space-y-1">
                      {Object.entries(pattern.context).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Outcomes</h4>
                    <div className="space-y-1">
                      {Object.entries(pattern.outcomes).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evidence</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-600">Occurred {pattern.frequency} times</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target size={14} className="text-gray-400" />
                        <span className="text-gray-600">Last: {pattern.lastOccurrence}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Supporting Evidence</h4>
                  <div className="flex flex-wrap gap-2">
                    {pattern.supportingEvidence.map((evidence, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {evidence}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPattern(pattern)}>
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="government"
                    onClick={() =>
                      toast.success('Pattern bookmarked for analysis', {
                        description: `Added ${pattern.patternType} to analytics queue.`,
                      })
                    }
                  >
                    Apply Pattern
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 size={20} />
                <span>Success Rate by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Technology Policy', success: 75, total: 8 },
                  { category: 'Health Policy', success: 90, total: 6 },
                  { category: 'Environmental Policy', success: 85, total: 5 },
                  { category: 'Education Policy', success: 60, total: 10 }
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <span className="text-sm font-medium">{item.success}% ({item.total} policies)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.success}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart size={20} />
                <span>Implementation Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { range: 'Under 12 months', percentage: 25, count: 8 },
                  { range: '1-2 years', percentage: 45, count: 14 },
                  { range: '2-3 years', percentage: 20, count: 6 },
                  { range: 'Over 3 years', percentage: 10, count: 3 }
                ].map((item) => (
                  <div key={item.range}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">{item.range}</span>
                      <span className="text-sm font-medium">{item.percentage}% ({item.count} policies)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}