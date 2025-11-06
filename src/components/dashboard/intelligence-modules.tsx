'use client'

import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Building,
  Zap,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

interface IntelligenceModulesProps {
  className?: string
}

export default function IntelligenceModules({ className }: IntelligenceModulesProps) {
  // Fetch real data from Convex
  const dashboardModules = useQuery(api.getDashboardModules.getDashboardModules, {})
  const stats = useQuery(api.queries.getStats, {})
  const insights = useQuery(api.queries.getInsights, {
    actionRequired: true,
  })
  const opportunities = useQuery(api.queries.getOpportunities, {})

  const isLoading = dashboardModules === undefined || stats === undefined

  // Find specific modules
  const resourceModule = dashboardModules?.find((m) => m.type === 'resource-allocation')
  const opportunityModule = dashboardModules?.find((m) => m.type === 'opportunity-radar')
  const performanceModule = dashboardModules?.find((m) => m.type === 'performance-monitor')

  const handleExportBudgetReport = () => {
    if (!stats) return

    const data = [
      {
        Metric: 'Total Budget',
        Value: stats.totalBudget,
        'Formatted Value': formatCurrency(stats.totalBudget),
      },
      {
        Metric: 'Total Spent',
        Value: stats.totalSpent,
        'Formatted Value': formatCurrency(stats.totalSpent),
      },
      {
        Metric: 'Budget Utilization',
        Value: stats.budgetUtilization,
        'Formatted Value': formatPercentage(stats.budgetUtilization),
      },
      {
        Metric: 'Total Projects',
        Value: stats.projects,
        'Formatted Value': stats.projects.toString(),
      },
      {
        Metric: 'Active Projects',
        Value: stats.activeProjects,
        'Formatted Value': stats.activeProjects.toString(),
      },
      {
        Metric: 'At Risk Projects',
        Value: stats.atRiskProjects,
        'Formatted Value': stats.atRiskProjects.toString(),
      },
    ]

    exportToCSV(data, 'budget-report')
    toast.success('Budget report exported successfully')
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Quick Actions */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <Button onClick={handleExportBudgetReport} variant="outline" size="sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Budget Report
        </Button>
      </div>

      {/* Intelligence Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Resource Allocation Module */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Building className="h-8 w-8 text-blue-500" />
              <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded">
                HIGH PRIORITY
              </span>
            </div>
            <CardTitle className="text-lg mt-3">Resource Allocation Intelligence</CardTitle>
            <CardDescription>Budget tracking and utilization efficiency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceModule && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-semibold">
                      {formatCurrency(resourceModule.data.totalBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-semibold">
                      {formatCurrency(resourceModule.data.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(resourceModule.data.available)}
                    </span>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Budget Efficiency</span>
                    <span className="font-semibold">
                      {formatPercentage(resourceModule.data.efficiency)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${resourceModule.data.efficiency}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {!resourceModule && (
              <p className="text-sm text-muted-foreground">Loading resource allocation data...</p>
            )}
          </CardContent>
        </Card>

        {/* Opportunity Radar Module */}
        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded">
                HIGH PRIORITY
              </span>
            </div>
            <CardTitle className="text-lg mt-3">Opportunity Radar</CardTitle>
            <CardDescription>Investment opportunities and market potential</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunityModule && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Opportunities</p>
                    <p className="text-2xl font-bold">
                      {opportunityModule.data.totalOpportunities}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold text-green-600">
                      {opportunityModule.data.highPriorityOpportunities}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estimated Value</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(opportunityModule.data.estimatedValue)}
                  </p>
                </div>
              </>
            )}

            {!opportunityModule && (
              <p className="text-sm text-muted-foreground">Loading opportunity data...</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Monitor Module */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Zap className="h-8 w-8 text-orange-500" />
              <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                MEDIUM PRIORITY
              </span>
            </div>
            <CardTitle className="text-lg mt-3">Performance Monitor</CardTitle>
            <CardDescription>Project delivery and execution tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceModule && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">
                      {performanceModule.data.totalProjects}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">At Risk</p>
                    <p className="text-2xl font-bold text-red-600">
                      {performanceModule.data.projectsAtRisk}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">On-Time Delivery</span>
                    <span className="font-semibold">
                      {formatPercentage(performanceModule.data.onTimeDelivery)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className="font-semibold">
                      {formatPercentage(performanceModule.data.qualityScore)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {!performanceModule && (
              <p className="text-sm text-muted-foreground">Loading performance data...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Insights Section */}
      {insights && insights.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Critical Insights Requiring Action
            </CardTitle>
            <CardDescription>
              {insights.length} insight{insights.length !== 1 ? 's' : ''} require immediate
              attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight: any) => (
                <div
                  key={insight._id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${
                      insight.impact === 'CRITICAL'
                        ? 'bg-red-500'
                        : insight.impact === 'HIGH'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    {insight.ministry && (
                      <p className="text-xs text-muted-foreground">
                        Ministry: {insight.ministry.name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {insight.confidence}% confidence
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ministries</p>
                <p className="text-2xl font-bold">{stats.ministries}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">{stats.opportunities}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">{formatPercentage(stats.budgetUtilization)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
