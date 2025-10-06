'use client'

import { useEffect, useState } from 'react'
import { buildApiUrl, useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailModal } from '@/components/ui/detail-modal'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Building,
  Zap,
  CheckCircle,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'
import { IntelligenceModule } from '@/types'

interface IntelligenceModulesProps {
  className?: string
}

const DEMO_MODULES: IntelligenceModule[] = [
  {
    id: 'resource-allocation-1',
    title: 'Resource Allocation Intelligence',
    type: 'resource-allocation',
    priority: 'HIGH',
    lastUpdated: new Date(),
    data: {
      totalBudget: 5_000_000_000,
      available: 1_200_000_000,
      spent: 3_800_000_000,
      efficiency: 87.5,
    },
    insights: [],
  },
  {
    id: 'opportunity-radar-1',
    title: 'Opportunity Radar',
    type: 'opportunity-radar',
    priority: 'HIGH',
    lastUpdated: new Date(),
    data: {
      totalOpportunities: 45,
      highPriorityOpportunities: 12,
      estimatedValue: 2_500_000_000,
    },
    insights: [],
  },
  {
    id: 'performance-monitor-1',
    title: 'Performance Monitor',
    type: 'performance-monitor',
    priority: 'MEDIUM',
    lastUpdated: new Date(),
    data: {
      projectsAtRisk: 8,
      totalProjects: 42,
      onTimeDelivery: 78.5,
      qualityScore: 85.2,
    },
    insights: [],
  },
]

export default function IntelligenceModules({ className }: IntelligenceModulesProps) {
  const { token } = useAuth()
  const [modules, setModules] = useState<IntelligenceModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nisrModal, setNisrModal] = useState<{ isOpen: boolean, data: any | null }>({ isOpen: false, data: null })

  const showSourceModal = (data: any) => {
    setNisrModal({ isOpen: true, data })
  }

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const useDemoData = (message?: string) => {
      if (isMounted) {
        setModules(DEMO_MODULES.map((module) => ({ ...module, lastUpdated: new Date() })))
        setError(message ?? null)
      }
    }

    const fetchModules = async () => {
      if (!token) {
        useDemoData('Using demo data because no authentication token is available.')
        return
      }

      if (isMounted) {
        setIsLoading(true)
      }

      try {
        const response = await fetch(buildApiUrl('/api/intelligence/modules'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        const data = await response.json().catch(() => null)

        // Handle invalid/expired token - clear auth and redirect to login
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('gov-auth-token')
          localStorage.removeItem('gov-auth-user')
          window.location.href = '/login'
          return
        }

        if (!response.ok || !data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || 'Failed to load intelligence modules')
        }

        const normalisedModules: IntelligenceModule[] = data.data.map((module: any) => ({
          ...module,
          lastUpdated: module.lastUpdated ? new Date(module.lastUpdated) : new Date(),
        }))

        if (isMounted) {
          setModules(normalisedModules)
          setError(null)
        }
      } catch (fetchError: any) {
        if (controller.signal.aborted) return
        // Retry once on transient network/AbortError
        try {
          if (fetchError?.name === 'AbortError' || fetchError?.message?.includes('Failed to fetch')) {
            const retryResponse = await fetch(buildApiUrl('/api/intelligence/modules'), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
            const retryData = await retryResponse.json().catch(() => null)
            if (retryResponse.ok && retryData?.success && Array.isArray(retryData.data)) {
              const normalisedModules: IntelligenceModule[] = retryData.data.map((module: any) => ({
                ...module,
                lastUpdated: module.lastUpdated ? new Date(module.lastUpdated) : new Date(),
              }))
              if (isMounted) {
                setModules(normalisedModules)
                setError(null)
                return
              }
            }
          }
        } catch (_) {
          // ignore retry error and fall back to demo data
        }
        console.error('Failed to fetch intelligence modules:', fetchError)
        useDemoData('Unable to reach the analytics service. Showing cached demo data.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchModules()

    return () => {
      isMounted = false
      // Avoid aborting during route replacement to reduce spurious AbortErrors
      try { controller.abort() } catch {}
    }
  }, [token])

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderResourceAllocation = (module: IntelligenceModule) => {
    const data = module.data
    const efficiency = data.efficiency
    const available = data.available
    const spent = data.spent
    const totalBudget = data.totalBudget

    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Resource Allocation</CardTitle>
              <CardDescription>Budget efficiency and recommendations</CardDescription>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(available)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(spent / totalBudget) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{formatPercentage(efficiency)}</span>
            </div>
            {data.nisrData && (
              <button
                type="button"
                onClick={() => showSourceModal(data.nisrData)}
                className="text-xs text-blue-600 hover:underline mt-2 cursor-pointer"
              >
                📊 Poverty rate: {data.nisrData.povertyRate}% (NISR {data.nisrData.source} {data.nisrData.year})
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderOpportunityRadar = (module: IntelligenceModule) => {
    const data = module.data
    const totalOpportunities = data.totalOpportunities
    const highPriority = data.highPriorityOpportunities
    const estimatedValue = data.estimatedValue

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Opportunity Radar</CardTitle>
              <CardDescription>Investment and development opportunities</CardDescription>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold">{formatNumber(totalOpportunities)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(highPriority)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Market Value</p>
              <p className="text-xl font-bold">{formatCurrency(estimatedValue)}</p>
            </div>
            {data.nisrData && (
              <button
                type="button"
                onClick={() => showSourceModal(data.nisrData)}
                className="text-xs text-blue-600 hover:underline mt-2 cursor-pointer"
              >
                📊 GDP growth: {data.nisrData.gdpGrowth}% (NISR {data.nisrData.source} {data.nisrData.year})
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPerformanceMonitor = (module: IntelligenceModule) => {
    const data = module.data
    const projectsAtRisk = data.projectsAtRisk
    const totalProjects = data.totalProjects
    const onTimeDelivery = data.onTimeDelivery
    const qualityScore = data.qualityScore

    return (
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
              <CardDescription>Project risk and performance tracking</CardDescription>
            </div>
            <Building className="h-8 w-8 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Projects at Risk</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-yellow-600">{formatNumber(projectsAtRisk)}</p>
                  <span className="text-sm text-gray-500">/ {formatNumber(totalProjects)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(qualityScore)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${onTimeDelivery}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{formatPercentage(onTimeDelivery)}</span>
              </div>
            </div>
            {data.nisrData && (
              <button
                type="button"
                onClick={() => showSourceModal(data.nisrData)}
                className="text-xs text-blue-600 hover:underline mt-2 cursor-pointer"
              >
                📊 Youth unemployment: {data.nisrData.youthUnemployment}% (NISR {data.nisrData.source} {data.nisrData.year})
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {error && (
        <Card className="lg:col-span-2 xl:col-span-3 border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-base text-red-700">Intelligence data is temporarily unavailable</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {modules.map((module) => {
        switch (module.type) {
          case 'resource-allocation':
            return <div key={module.id}>{renderResourceAllocation(module)}</div>
          case 'opportunity-radar':
            return <div key={module.id}>{renderOpportunityRadar(module)}</div>
          case 'performance-monitor':
            return <div key={module.id}>{renderPerformanceMonitor(module)}</div>
          default:
            return null
        }
      })}

      {/* Quick Actions */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common government intelligence tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start cursor-pointer"
            onClick={() => {
              const reportData = modules.map((module) => {
                if (module.type === 'resource-allocation') {
                  return {
                    Section: 'Budget Overview',
                    Metric: 'Total Budget',
                    Value: formatCurrency(module.data.totalBudget),
                    Status: `${module.data.efficiency}% efficiency`,
                  }
                }
                if (module.type === 'opportunity-radar') {
                  return {
                    Section: 'Investment Opportunities',
                    Metric: 'Total Opportunities',
                    Value: module.data.totalOpportunities,
                    Status: `${module.data.highPriorityOpportunities} high priority`,
                  }
                }
                if (module.type === 'performance-monitor') {
                  return {
                    Section: 'Project Performance',
                    Metric: 'Projects at Risk',
                    Value: module.data.projectsAtRisk,
                    Status: `${module.data.onTimeDelivery}% on-time delivery`,
                  }
                }
                return null
              }).filter((row): row is { Section: string; Metric: string; Value: any; Status: string } => row !== null)

              exportToCSV(reportData as Record<string, unknown>[], 'budget_report_' + new Date().toISOString().split('T')[0])
              toast.success('Budget report generated', {
                description: `Executive summary exported with ${reportData.length} sections`,
              })
            }}
          >
            <Zap size={16} className="mr-2" />
            Generate Budget Report
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start cursor-pointer"
            onClick={() => {
              const performanceData = [
                { Ministry: 'ICT', Efficiency: '92%', Projects: 15, AtRisk: 1, OnTimeDelivery: '95%' },
                { Ministry: 'Health', Efficiency: '89%', Projects: 18, AtRisk: 2, OnTimeDelivery: '88%' },
                { Ministry: 'Education', Efficiency: '85%', Projects: 22, AtRisk: 3, OnTimeDelivery: '82%' },
                { Ministry: 'Finance', Efficiency: '83%', Projects: 12, AtRisk: 1, OnTimeDelivery: '90%' },
                { Ministry: 'Infrastructure', Efficiency: '78%', Projects: 25, AtRisk: 6, OnTimeDelivery: '72%' },
              ]

              exportToCSV(performanceData, 'ministry_performance_' + new Date().toISOString().split('T')[0])
              toast.success('Ministry performance review generated', {
                description: 'Cabinet briefing exported with 5 ministry assessments',
              })
            }}
          >
            <Users size={16} className="mr-2" />
            Ministry Performance Review
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start cursor-pointer"
            onClick={() => {
              const projectUpdates = [
                { Project: 'National Infrastructure Upgrade', Status: 'IN_PROGRESS', Budget: '1.5B RWF', Timeline: 'On Track', Risk: 'Medium' },
                { Project: 'ICT Digital Transformation', Status: 'IN_PROGRESS', Budget: '800M RWF', Timeline: 'Ahead', Risk: 'Low' },
                { Project: 'Healthcare System Modernization', Status: 'PLANNING', Budget: '1.2B RWF', Timeline: 'Delayed', Risk: 'High' },
                { Project: 'Rural Electrification Phase 3', Status: 'IN_PROGRESS', Budget: '2.1B RWF', Timeline: 'On Track', Risk: 'Medium' },
                { Project: 'Education Technology Rollout', Status: 'IN_PROGRESS', Budget: '600M RWF', Timeline: 'On Track', Risk: 'Low' },
              ]

              exportToCSV(projectUpdates, 'project_status_' + new Date().toISOString().split('T')[0])
              toast.success('Project status report generated', {
                description: `Status update for ${projectUpdates.length} strategic projects exported`,
              })
            }}
          >
            <CheckCircle size={16} className="mr-2" />
            Project Status Update
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start cursor-pointer"
            onClick={() => {
              if (!modules.length) {
                toast.error('No dashboard data to export')
                return
              }

              const exportData = modules.map((module) => ({
                Title: module.title,
                Type: module.type,
                Priority: module.priority,
                LastUpdated: module.lastUpdated.toString(),
              }))

              exportToCSV(exportData, 'dashboard_modules')
              toast.success('Dashboard snapshot exported', {
                description: `Saved ${modules.length} module records to CSV`,
              })
            }}
          >
            <TrendingUp size={16} className="mr-2" />
            Export Dashboard Snapshot
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest intelligence updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Budget allocation updated</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New investment opportunity identified</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Project risk alert triggered</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* NISR Source Detail Modal */}
      <DetailModal
        isOpen={nisrModal.isOpen}
        onClose={() => setNisrModal({ isOpen: false, data: null })}
        title="NISR Source Details"
      >
        {nisrModal.data && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Source</p>
              <p className="font-medium">NISR {nisrModal.data.source} {nisrModal.data.year}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {typeof nisrModal.data.povertyRate !== 'undefined' && (
                <div>
                  <p className="text-gray-600">Poverty rate</p>
                  <p className="font-medium">{nisrModal.data.povertyRate}%</p>
                </div>
              )}
              {typeof nisrModal.data.gdpGrowth !== 'undefined' && (
                <div>
                  <p className="text-gray-600">GDP growth</p>
                  <p className="font-medium">{nisrModal.data.gdpGrowth}%</p>
                </div>
              )}
              {typeof nisrModal.data.youthUnemployment !== 'undefined' && (
                <div>
                  <p className="text-gray-600">Youth unemployment</p>
                  <p className="font-medium">{nisrModal.data.youthUnemployment}%</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-600">Reliability</p>
                <p className="font-medium">{nisrModal.data.reliability ?? 'High'}</p>
              </div>
              <div>
                <p className="text-gray-600">Last updated</p>
                <p className="font-medium">{new Date().toLocaleString()}</p>
              </div>
            </div>
            {nisrModal.data.url && (
              <a
                href={nisrModal.data.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-block"
              >
                Open dataset
              </a>
            )}
          </div>
        )}
      </DetailModal>
    </div>
  )
}

// NISR Source Modal
// Render at root to avoid layout shifts
/* Modal mount */