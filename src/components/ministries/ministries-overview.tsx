'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailModal } from '@/components/ui/detail-modal'
import {
  Building,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Globe,
  LineChart,
  ListFilter,
  Shield,
  Sparkles,
  Users
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

interface MinistryPerformance {
  id: string
  name: string
  minister: string
  budget: number
  utilisation: number
  efficiency: number
  flagshipProjects: number
  impactScore: number
  priorityInitiatives: string[]
}

const MOCK_MINISTRY_DATA: MinistryPerformance[] = [
  {
    id: 'ict',
    name: 'Ministry of ICT & Innovation',
    minister: 'Hon. Paula Ingabire',
    budget: 480_000_000,
    utilisation: 0.82,
    efficiency: 0.91,
    flagshipProjects: 14,
    impactScore: 88,
    priorityInitiatives: [
      'Nationwide fiber backhaul expansion',
      'GovStack interoperability rollout',
      'Digital skills accelerator'
    ]
  },
  {
    id: 'health',
    name: 'Ministry of Health',
    minister: 'Dr. Sabin Nsanzimana',
    budget: 720_000_000,
    utilisation: 0.87,
    efficiency: 0.84,
    flagshipProjects: 18,
    impactScore: 91,
    priorityInitiatives: [
      'Primary care facility upgrades',
      'Telemedicine service network',
      'Community health worker program'
    ]
  },
  {
    id: 'education',
    name: 'Ministry of Education',
    minister: 'Dr. Valentine Uwamariya',
    budget: 650_000_000,
    utilisation: 0.79,
    efficiency: 0.76,
    flagshipProjects: 22,
    impactScore: 74,
    priorityInitiatives: [
      'Foundational literacy program',
      'STEM excellence centers scale-up',
      'TVET modernisation wave 2'
    ]
  },
  {
    id: 'infrastructure',
    name: 'Ministry of Infrastructure',
    minister: 'Hon. Jimmy Gasore',
    budget: 890_000_000,
    utilisation: 0.69,
    efficiency: 0.71,
    flagshipProjects: 25,
    impactScore: 69,
    priorityInitiatives: [
      'Airport modernisation Ph.2',
      'Green mobility corridors',
      'Regional logistics hub build-out'
    ]
  },
  {
    id: 'agriculture',
    name: 'Ministry of Agriculture',
    minister: 'Hon. Ildephonse Musafiri',
    budget: 410_000_000,
    utilisation: 0.92,
    efficiency: 0.86,
    flagshipProjects: 16,
    impactScore: 83,
    priorityInitiatives: [
      'Climate-smart irrigation program',
      'Agro-export value chain upgrades',
      'National seed bank digitisation'
    ]
  }
]

interface MinistriesOverviewProps {
  className?: string
}

export default function MinistriesOverview({ className }: MinistriesOverviewProps) {
  const [ministries, setMinistries] = useState<MinistryPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryPerformance | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinistries(MOCK_MINISTRY_DATA)
      setIsLoading(false)
    }, 450)

    return () => clearTimeout(timer)
  }, [])

  const summary = useMemo(() => {
    if (!ministries.length) {
      return {
        totalBudget: 0,
        avgEfficiency: 0,
        flagshipPrograms: 0,
        topImpact: null as MinistryPerformance | null
      }
    }

    const totalBudget = ministries.reduce((acc, ministry) => acc + ministry.budget, 0)
    const flagshipPrograms = ministries.reduce((acc, ministry) => acc + ministry.flagshipProjects, 0)
    const avgEfficiency = ministries.reduce((acc, ministry) => acc + ministry.efficiency, 0) / ministries.length
    const topImpact = ministries.slice().sort((a, b) => b.impactScore - a.impactScore)[0]

    return {
      totalBudget,
      avgEfficiency,
      flagshipPrograms,
      topImpact
    }
  }, [ministries])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className ?? ''}`}>
        <div className="h-10 w-72 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ministry Performance Overview</h1>
          <p className="text-gray-600 mt-1">Track execution efficiency, flagship initiatives, and impact across government ministries</p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            disabled
            title="Available after NISR data integration"
          >
            <ListFilter size={16} />
            Configure KPIs
          </Button>
          <Button
            variant="government"
            className="flex items-center gap-2"
            onClick={() => {
              toast.success('Briefing generation started', {
                description: 'Compiling cross-ministry insights for Cabinet review.',
              })
            }}
          >
            <Sparkles size={16} />
            Generate Briefing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Portfolio Budget</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalBudget)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Across {formatNumber(ministries.length)} national ministries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <LineChart size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Efficiency</p>
                <p className="text-xl font-bold">{formatPercentage(summary.avgEfficiency * 100)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Weighted by implementation capability</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Flagship Initiatives</p>
                <p className="text-xl font-bold">{formatNumber(summary.flagshipPrograms)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Tracked weekly for Cabinet updates</p>
          </CardContent>
        </Card>

        {summary.topImpact && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Impact Ministry</p>
                  <p className="text-base font-bold text-gray-900">{summary.topImpact.name}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Impact score {summary.topImpact.impactScore}/100</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-lg">Performance Leaderboard</CardTitle>
            <CardDescription>Compare budget utilisation, efficiency, and project execution across ministries</CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => {
              if (!ministries.length) {
                toast.error('No ministry data to export')
                return
              }

              const exportRows = ministries.map((ministry) => ({
                Ministry: ministry.name,
                Minister: ministry.minister,
                Budget: ministry.budget,
                Utilisation: `${formatPercentage(ministry.utilisation * 100)}`,
                Efficiency: `${formatPercentage(ministry.efficiency * 100)}`,
                FlagshipProjects: ministry.flagshipProjects,
                ImpactScore: ministry.impactScore,
              }))

              exportToCSV(exportRows, 'ministries_overview')
              toast.success('Ministry metrics exported', {
                description: `Saved ${ministries.length} ministry records to CSV`,
              })
            }}
          >
            Export Metrics
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leadership</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagship Projects</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ministries.map((ministry) => (
                <tr
                  key={ministry.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedMinistry(ministry)}
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{ministry.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{ministry.minister}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="font-semibold text-gray-900">{formatCurrency(ministry.budget)}</div>
                    <div className="text-xs text-gray-500">Annual allocation</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${ministry.utilisation * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{formatPercentage(ministry.utilisation * 100)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatPercentage(ministry.efficiency * 100)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatNumber(ministry.flagshipProjects)}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      <BarChart3 size={12} />
                      {ministry.impactScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Initiatives by Ministry</CardTitle>
          <CardDescription>Strategic focus areas aligned with Vision 2050 delivery goals</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMinistry(ministry)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedMinistry(ministry) }}
              className="p-4 border border-gray-200 rounded-lg space-y-3 text-left transition-colors hover:border-blue-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{ministry.name}</p>
                  <p className="text-xs text-gray-500">Lead: {ministry.minister}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  <Users size={12} />
                  Impact {ministry.impactScore}
                </span>
              </div>

              <ul className="text-xs text-gray-600 space-y-2">
                {ministry.priorityInitiatives.map((initiative) => (
                  <li key={initiative} className="leading-snug">
                    <ArrowUpRight size={12} className="inline mr-1 text-blue-500" />
                    {initiative}
                  </li>
                ))}
              </ul>

              <Button variant="ghost" className="p-0 text-sm text-blue-600">
                View implementation plan
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <DetailModal
        isOpen={selectedMinistry !== null}
        onClose={() => setSelectedMinistry(null)}
        title={selectedMinistry?.name ?? 'Ministry Details'}
        maxWidth="xl"
      >
        {selectedMinistry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Leadership</p>
                <p className="text-base text-gray-900">{selectedMinistry.minister}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Budget Allocation</p>
                <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedMinistry.budget)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Budget Utilisation</p>
                <p className="text-lg font-semibold text-gray-900">{formatPercentage(selectedMinistry.utilisation * 100)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Operational Efficiency</p>
                <p className="text-lg font-semibold text-gray-900">{formatPercentage(selectedMinistry.efficiency * 100)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Flagship Projects</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(selectedMinistry.flagshipProjects)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Impact Narrative</p>
              <p className="mt-2 text-sm text-gray-700">
                {`${selectedMinistry.name} is delivering a portfolio of ${formatNumber(selectedMinistry.flagshipProjects)} flagship initiatives with an overall impact score of ${selectedMinistry.impactScore}. Budget utilisation currently stands at ${formatPercentage(selectedMinistry.utilisation * 100)}, with efficiency at ${formatPercentage(selectedMinistry.efficiency * 100)}.`}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Priority Initiatives</p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {selectedMinistry.priorityInitiatives.map((initiative) => (
                  <li key={initiative}>• {initiative}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row">
              <Button variant="government" className="flex-1">
                Open Ministry Brief
              </Button>
              <Button variant="outline" className="flex-1">
                Export KPI Snapshot
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  )
}


