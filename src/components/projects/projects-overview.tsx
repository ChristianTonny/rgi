'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailModal } from '@/components/ui/detail-modal'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Loader2,
  MapPin,
  PieChart,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target
} from 'lucide-react'

interface ProjectSummary {
  id: string
  name: string
  ministry: string
  budget: number
  spent: number
  status: 'PLANNING' | 'ACTIVE' | 'DELAYED' | 'COMPLETED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  beneficiaries: number
  startDate: string
  endDate: string
  location: string
  milestoneProgress: number
}

const PROJECT_STATUS_COLORS: Record<ProjectSummary['status'], string> = {
  PLANNING: 'text-blue-600 bg-blue-100',
  ACTIVE: 'text-green-600 bg-green-100',
  DELAYED: 'text-yellow-700 bg-yellow-100',
  COMPLETED: 'text-gray-600 bg-gray-100'
}

const PROJECT_RISK_COLORS: Record<ProjectSummary['riskLevel'], string> = {
  LOW: 'text-green-600 bg-green-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  HIGH: 'text-red-600 bg-red-100',
  CRITICAL: 'text-red-700 bg-red-200'
}

const MOCK_PROJECTS: ProjectSummary[] = [
  {
    id: 'proj-001',
    name: 'Rural Electrification Phase 3',
    ministry: 'Infrastructure',
    budget: 850_000_000,
    spent: 640_000_000,
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    beneficiaries: 120_000,
    startDate: '2023-02-01',
    endDate: '2025-06-30',
    location: 'Eastern & Southern Provinces',
    milestoneProgress: 68
  },
  {
    id: 'proj-002',
    name: 'Digital ID System Rollout',
    ministry: 'ICT & Innovation',
    budget: 320_000_000,
    spent: 210_000_000,
    status: 'DELAYED',
    riskLevel: 'MEDIUM',
    beneficiaries: 13_000_000,
    startDate: '2022-09-15',
    endDate: '2024-12-31',
    location: 'Nationwide',
    milestoneProgress: 54
  },
  {
    id: 'proj-003',
    name: 'Primary Healthcare Expansion',
    ministry: 'Health',
    budget: 1_200_000_000,
    spent: 930_000_000,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    beneficiaries: 2_400_000,
    startDate: '2022-04-01',
    endDate: '2024-11-30',
    location: 'Western & Northern Provinces',
    milestoneProgress: 81
  },
  {
    id: 'proj-004',
    name: 'Smart Irrigation Program',
    ministry: 'Agriculture',
    budget: 460_000_000,
    spent: 190_000_000,
    status: 'PLANNING',
    riskLevel: 'MEDIUM',
    beneficiaries: 85_000,
    startDate: '2024-07-01',
    endDate: '2026-03-31',
    location: 'Eastern Province',
    milestoneProgress: 24
  },
  {
    id: 'proj-005',
    name: 'STEM Excellence Centers',
    ministry: 'Education',
    budget: 280_000_000,
    spent: 260_000_000,
    status: 'COMPLETED',
    riskLevel: 'LOW',
    beneficiaries: 45_000,
    startDate: '2021-01-10',
    endDate: '2023-12-20',
    location: 'Kigali & Secondary Cities',
    milestoneProgress: 100
  }
]

const FILTER_STORAGE_KEY = 'projects:filters'
const WATCHLIST_STORAGE_KEY = 'projects:watchlist'
const PLANS_STORAGE_KEY = 'projects:plans'

const STATUS_OPTIONS: ProjectSummary['status'][] = ['PLANNING', 'ACTIVE', 'DELAYED', 'COMPLETED']
const RISK_OPTIONS: ProjectSummary['riskLevel'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const MINISTRIES = Array.from(new Set(MOCK_PROJECTS.map((project) => project.ministry))).sort()

type ProjectFilters = {
  statuses: ProjectSummary['status'][]
  riskLevels: ProjectSummary['riskLevel'][]
  ministries: string[]
  minProgress: number
  maxProgress: number
}

type ProjectPlanRecord = {
  id: string
  projectId: string
  projectName: string
  summary: string
  milestones: string[]
  support: string[]
  nextSteps: string[]
  updatedAt: string
}

const DEFAULT_FILTERS: ProjectFilters = {
  statuses: [],
  riskLevels: [],
  ministries: [],
  minProgress: 0,
  maxProgress: 100,
}

interface ProjectsOverviewProps {
  className?: string
}

export default function ProjectsOverview({ className }: ProjectsOverviewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false)
  const [planProject, setPlanProject] = useState<ProjectSummary | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isPlanGenerating, setIsPlanGenerating] = useState(false)
  const [isPlanRefreshing, setIsPlanRefreshing] = useState(false)
  const [isPlanExporting, setIsPlanExporting] = useState(false)
  const [planSummary, setPlanSummary] = useState({
    summary: '',
    milestones: [] as string[],
    support: [] as string[],
    nextSteps: [] as string[],
    updatedAt: '',
  })
  const [planHistory, setPlanHistory] = useState<ProjectPlanRecord[]>([])
  const planPersistInitialized = useRef(false)
  const filtersInitialized = useRef(false)
  const planLoadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasHydrated = useRef(false)

  const buildPlanRecord = useCallback((project: ProjectSummary): ProjectPlanRecord => {
    const riskStatement =
      project.riskLevel === 'HIGH' || project.riskLevel === 'CRITICAL'
        ? `Mitigate elevated ${project.riskLevel.toLowerCase()} risk profile with rapid unblockers.`
        : `Maintain ${project.riskLevel.toLowerCase()} risk posture while accelerating delivery.`

    const budgetUtilization = Math.round((project.spent / project.budget) * 100)

    return {
      id: `${project.id}-plan`,
      projectId: project.id,
      projectName: project.name,
      summary: `${project.name} requires coordinated delivery support over the next 90 days to unlock impact for ${formatNumber(
        project.beneficiaries
      )} citizens. ${riskStatement}`,
      milestones: [
        `Complete milestone package to reach ${Math.min(project.milestoneProgress + 12, 100)}% delivery progress`,
        `Confirm ministry alignment on procurement and financing decisions by ${project.startDate}`,
        `Publish field implementation update highlighting beneficiary reach in ${project.location}`,
      ],
      support: [
        'Delivery acceleration squad with cross-ministry representation',
        `Cabinet facilitation to clear outstanding approvals (${budgetUtilization}% of budget already committed)`,
        'Real-time risk monitoring with weekly escalation path to Delivery Unit',
      ],
      nextSteps: [
        'Schedule weekly war-room to track milestone burn-down',
        'Deploy analytics dashboard to surface blockers and resource gaps',
        'Coordinate communications plan for provincial leadership and partners',
      ],
      updatedAt: new Date().toISOString(),
    }
  }, [])

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handlePlanOpen = useCallback(
    (project: ProjectSummary, shouldSyncParam = true) => {
      let existingPlan = planHistory.find((item) => item.projectId === project.id)

      if (!existingPlan) {
        const storedPlans = JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY) ?? '[]') as ProjectPlanRecord[]
        existingPlan = storedPlans.find((plan) => plan.projectId === project.id)
        if (existingPlan) {
          setPlanHistory((prev) => [existingPlan as ProjectPlanRecord, ...prev.filter((item) => item.projectId !== project.id)])
        }
      }

      const planRecord = existingPlan ?? buildPlanRecord(project)

    setPlanProject(project)
      setPlanSummary({
        summary: planRecord.summary,
        milestones: planRecord.milestones,
        support: planRecord.support,
        nextSteps: planRecord.nextSteps,
        updatedAt: planRecord.updatedAt,
      })

      setPlanHistory((prev) => {
        const withoutCurrent = prev.filter((item) => item.projectId !== project.id)
        const nextHistory = [planRecord, ...withoutCurrent].slice(0, 8)
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(nextHistory))
        return nextHistory
      })

      if (shouldSyncParam) {
        updateParam('plan', project.id)
      }

    setIsPlanModalOpen(true)
    },
    [buildPlanRecord, planHistory, updateParam]
  )

  const handleAnalyze = useCallback((project: ProjectSummary) => {
    const payload = {
      id: `project-${project.id}-${Date.now()}`,
      title: `Project analysis: ${project.name}`,
      summary: `${project.ministry} project with ${formatPercentage(project.milestoneProgress)} completion and ${project.riskLevel} risk.`,
      drivers: [
        `Budget ${formatCurrency(project.budget)} (${formatPercentage((project.spent / project.budget) * 100)} spent)`,
        `Risk level ${project.riskLevel}`,
        `Beneficiaries ${formatNumber(project.beneficiaries)}`,
      ],
      recommendation: 'Align delivery unit, unblock critical milestones, and brief cabinet on required support.',
    }

    window.localStorage.setItem('intelligence:pending-insight', JSON.stringify(payload))
    const params = new URLSearchParams(window.location.search)
    params.set('view', 'intelligence')
    params.set('conversation', payload.id)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    toast.success('Sent to intelligence workspace', {
      description: `${project.name} context queued for AI assistant`,
    })
  }, [])

  const downloadPlanBrief = useCallback(
    (
      project: ProjectSummary,
      plan?: Pick<ProjectPlanRecord, 'summary' | 'milestones' | 'support' | 'nextSteps' | 'updatedAt'>
    ) => {
      const lines = [
        `Project Brief: ${project.name}`,
        '',
        `Ministry: ${project.ministry}`,
        `Budget: ${formatCurrency(project.budget)}`,
        `Progress: ${project.milestoneProgress}%`,
        `Risk Level: ${project.riskLevel}`,
        `Beneficiaries: ${formatNumber(project.beneficiaries)}`,
        '',
      ]

      if (plan) {
        lines.push('Plan Summary:', plan.summary, '')

        if (plan.milestones.length) {
          lines.push('Next Milestones:')
          plan.milestones.forEach((item) => lines.push(`- ${item}`))
          lines.push('')
        }

        if (plan.support.length) {
          lines.push('Support Needed:')
          plan.support.forEach((item) => lines.push(`- ${item}`))
          lines.push('')
        }

        if (plan.nextSteps.length) {
          lines.push('Immediate Next Steps:')
          plan.nextSteps.forEach((item) => lines.push(`- ${item}`))
          lines.push('')
        }

        if (plan.updatedAt) {
          lines.push(`Plan refreshed: ${new Date(plan.updatedAt).toLocaleString()}`)
        }
      } else {
        lines.push(
          'Next Milestones:',
          '- Align delivery unit on feeder line schedule',
          '- Clear procurement backlog within 14 days',
          '',
          'Support Needed:',
          '- Rapid Taskforce oversight',
          '- Payment approvals for suppliers',
          ''
        )
      }

      const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/\s+/g, '_')}_brief.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Project brief prepared', {
      description: `${project.name} summary downloaded`,
    })
    },
    []
  )

  const toggleWatchlist = useCallback(
    (project: ProjectSummary) => {
      setWatchlist((prev) => {
        const alreadyTracked = prev.includes(project.id)
        const next = alreadyTracked ? prev.filter((id) => id !== project.id) : [...prev, project.id]

        toast.success(alreadyTracked ? 'Removed from project focus list' : 'Added to project focus list', {
          description: project.name,
        })

        return next
      })
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      const storedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY) ?? 'null') as ProjectFilters | null
      const storedWatchlist = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) ?? '[]') as string[]
      const storedPlans = JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY) ?? '[]') as ProjectPlanRecord[]

      if (storedFilters) {
        setFilters({
          statuses: Array.isArray(storedFilters.statuses) ? storedFilters.statuses : [],
          riskLevels: Array.isArray(storedFilters.riskLevels) ? storedFilters.riskLevels : [],
          ministries: Array.isArray(storedFilters.ministries) ? storedFilters.ministries : [],
          minProgress: typeof storedFilters.minProgress === 'number' ? storedFilters.minProgress : 0,
          maxProgress: typeof storedFilters.maxProgress === 'number' ? storedFilters.maxProgress : 100,
        })
      }

      setWatchlist(Array.isArray(storedWatchlist) ? storedWatchlist : [])
      if (Array.isArray(storedPlans)) {
        setPlanHistory(storedPlans)
      }
    } catch (error) {
      console.error('Failed to restore project filters', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true
      return
    }

    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(planHistory))
  }, [planHistory])

  useEffect(() => {
    const planParam = searchParams.get('plan')
    const watchlistParam = searchParams.get('watchlist')

    if (planParam) {
      const project = projects.find((item) => item.id === planParam)
      if (project) {
        handlePlanOpen(project, false)
      }
    } else if (hasHydrated.current && planProject) {
      setPlanProject(null)
      setIsPlanModalOpen(false)
    }

    setShowWatchlistOnly(watchlistParam === 'true')
  }, [handlePlanOpen, planProject, searchParams])

  const highImpactProjects = useMemo(
    () =>
      projects
        .filter((project) => project.milestoneProgress >= 60)
        .sort((a, b) => b.milestoneProgress - a.milestoneProgress)
        .slice(0, 3),
    [projects]
  )

  const filteredProjects = useMemo(() => {
    let working = [...projects]

    if (showWatchlistOnly && watchlist.length) {
      working = working.filter((project) => watchlist.includes(project.id))
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      working = working.filter((project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.ministry.toLowerCase().includes(lowerQuery) ||
        project.location.toLowerCase().includes(lowerQuery)
      )
    }

    if (filters.statuses.length) {
      working = working.filter((project) => filters.statuses.includes(project.status))
    }

    if (filters.riskLevels.length) {
      working = working.filter((project) => filters.riskLevels.includes(project.riskLevel))
    }

    if (filters.ministries.length) {
      working = working.filter((project) => filters.ministries.includes(project.ministry))
    }

    working = working.filter(
      (project) => project.milestoneProgress >= filters.minProgress && project.milestoneProgress <= filters.maxProgress
    )

    return working.sort((a, b) => b.milestoneProgress - a.milestoneProgress)
  }, [filters, projects, searchQuery, showWatchlistOnly, watchlist])

  const activeFilterCount =
    filters.statuses.length +
    filters.riskLevels.length +
    filters.ministries.length +
    (filters.minProgress > 0 ? 1 : 0) +
    (filters.maxProgress < 100 ? 1 : 0)

  const totals = useMemo(() => {
    const scopedProjects = showWatchlistOnly && watchlist.length
      ? projects.filter((p) => watchlist.includes(p.id))
      : filteredProjects.length > 0 ? filteredProjects : projects

    if (!scopedProjects.length) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        projectsAtRisk: 0,
        completionRate: 0,
        totalBeneficiaries: 0,
        projectCount: 0,
        isFiltered: false,
      }
    }

    const totalBudget = scopedProjects.reduce((acc, project) => acc + project.budget, 0)
    const totalSpent = scopedProjects.reduce((acc, project) => acc + project.spent, 0)
    const projectsAtRisk = scopedProjects.filter((project) => ['HIGH', 'CRITICAL'].includes(project.riskLevel)).length
    const completionRate = Math.round(
      scopedProjects.reduce((acc, project) => acc + project.milestoneProgress, 0) / scopedProjects.length
    )
    const totalBeneficiaries = scopedProjects.reduce((acc, project) => acc + project.beneficiaries, 0)

    return {
      totalBudget,
      totalSpent,
      projectsAtRisk,
      completionRate,
      totalBeneficiaries,
      projectCount: scopedProjects.length,
      isFiltered: showWatchlistOnly || activeFilterCount > 0 || searchQuery.trim() !== '',
    }
  }, [projects, filteredProjects, showWatchlistOnly, watchlist, activeFilterCount, searchQuery])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className ?? ''}`}>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-4 bg-gray-200 rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchQuery('')
    setShowWatchlistOnly(false)
    toast.success('Filters reset', {
      description: 'Showing all strategic projects',
    })
  }

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strategic Projects Portfolio</h1>
          <p className="text-gray-600 mt-1">Monitor execution, risk, and impact across priority government initiatives</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
          <Button
            variant="outline"
            className={cn('flex items-center gap-2', activeFilterCount ? 'border-blue-300 text-blue-700' : '')}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter size={16} />
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-700">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            variant={showWatchlistOnly ? 'government' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => {
              const next = !showWatchlistOnly

              setShowWatchlistOnly(next)
              updateParam('watchlist', next ? 'true' : null)
              toast.success(next ? 'Showing focus list' : 'Showing all projects', {
                description: next
                  ? 'Only projects you are tracking are visible'
                  : 'All strategic projects are now visible',
              })
            }}
          >
            <Star size={16} />
            {showWatchlistOnly ? 'Focus List Active' : 'Focus List'}
          </Button>
          <Button
            variant="government"
            className="flex items-center gap-2"
            onClick={() => {
              if (!filteredProjects.length) {
                toast.error('Select a project before generating a briefing')
                return
              }

              const targetProject = filteredProjects[0]
              updateParam('plan', targetProject.id)
          handlePlanOpen(targetProject)
            }}
          >
            <ArrowUpRight size={16} />
            New Project Brief
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects, ministries, or locations"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">Query: {searchQuery}</span>
            )}
            {filters.statuses.map((status) => (
              <span key={`status-${status}`} className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                {status}
              </span>
            ))}
            {filters.riskLevels.map((risk) => (
              <span key={`risk-${risk}`} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                {risk} risk
              </span>
            ))}
            {filters.ministries.map((ministry) => (
              <span key={`ministry-${ministry}`} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                {ministry}
              </span>
            ))}
            {(filters.minProgress > 0 || filters.maxProgress < 100) && (
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                {filters.minProgress}% - {filters.maxProgress}% progress
              </span>
            )}

            {(searchQuery || activeFilterCount) && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-blue-100 bg-blue-50/50">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-blue-900">Active Budget</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(totals.totalBudget)}</p>
                </div>
              </div>
              <p className="text-xs text-blue-800">
                {totals.isFiltered
                  ? `${formatNumber(totals.projectCount)} of ${formatNumber(projects.length)} projects in view`
                  : `Across ${formatNumber(projects.length)} strategic projects`}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-green-50/50">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-green-900">Delivery Progress</p>
                  <p className="text-xl font-bold text-green-900">{formatPercentage(totals.completionRate)}</p>
                </div>
              </div>
              <p className="text-xs text-green-800">Average milestone completion rate</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-100 bg-amber-50/50">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-amber-900">Projects At Risk</p>
                  <p className="text-xl font-bold text-amber-900">{formatNumber(totals.projectsAtRisk)}</p>
                </div>
              </div>
              <p className="text-xs text-amber-800">Weekly trend: +1 vs last week</p>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-purple-50/50">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm text-purple-900">Beneficiaries Reached</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatNumber(totals.totalBeneficiaries)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-purple-800">
                {totals.isFiltered ? 'In filtered view' : 'Directly impacted citizens'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Delivery Focus Week</p>
                  <span className="text-xs font-medium text-blue-600">AI Recommendation</span>
                </div>
                <p className="text-sm text-gray-600">
                  Prioritize unblockers for Rural Electrification, fast-track procurement for Digital ID rollout, and confirm partner agreements for Healthcare expansion.
                </p>
              </div>
              <Button
                variant="ghost"
                className="mt-4 justify-start gap-2 text-sm text-blue-700"
                onClick={() => {
                  const insightPayload = {
                    id: `project-focus-${Date.now()}`,
                    title: 'Delivery focus: Projects portfolio',
                    summary: 'Key blockers and interventions for infrastructure, digital identity, and healthcare delivery acceleration.',
                    drivers: [
                      'Rural Electrification high-risk feeders require rapid response squads',
                      'Digital ID rollout needs synchronized procurement approvals',
                      'Healthcare expansion scaling best practices to 12 new districts',
                    ],
                    recommendation: 'Launch a cabinet briefing next Monday outlining unblockers and support needed from each ministry.',
                  }

              window.localStorage.setItem('intelligence:pending-insight', JSON.stringify(insightPayload))
                  toast.success('Sent to intelligence workspace', {
                    description: 'AI assistant will pick up the delivery focus context.',
                  })
                }}
              >
                <Sparkles size={16} /> Apply Lessons
              </Button>
            </CardContent>
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Portfolio Tracker</CardTitle>
              <CardDescription>Monitor expenditure, delivery status, and coverage across ministries</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                if (!projects.length) {
                  toast.error('No projects available to export')
                  return
                }

                const exportRows = projects.map((project) => ({
                  Project: project.name,
                  Ministry: project.ministry,
                  Budget: project.budget,
                  Status: project.status,
                  Risk: project.riskLevel,
                  Progress: `${project.milestoneProgress}%`,
                }))

                exportToCSV(exportRows, 'projects_overview')
                toast.success('Projects exported successfully', {
                  description: `Exported ${projects.length} project records to CSV`,
                })
              }}
            >
              Export Data
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {project.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 cursor-pointer" onClick={() => setSelectedProject(project)}>{project.ministry}</td>
                    <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <div className="font-medium text-gray-900">{formatCurrency(project.budget)}</div>
                      <div className="text-xs text-gray-500">{formatPercentage((project.spent / project.budget) * 100)} spent</div>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_RISK_COLORS[project.riskLevel]}`}>
                        {project.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${project.milestoneProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{project.milestoneProgress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAnalyze(project)
                        }}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Analyze
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">High-Impact Projects</CardTitle>
              <CardDescription>Highest progress with significant beneficiary reach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {highImpactProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg transition-colors hover:border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.ministry}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_RISK_COLORS[project.riskLevel]}`}>
                      {project.riskLevel}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Milestone completion</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-green-600" style={{ width: `${project.milestoneProgress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{project.milestoneProgress}%</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {project.startDate} → {project.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} />
                      {formatNumber(project.beneficiaries)} beneficiaries
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Outlook</CardTitle>
              <CardDescription>Projected completion mix for next 6 months</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[{
                label: 'On Track',
                value: 52,
                color: 'bg-green-600'
              }, {
                label: 'Needs Attention',
                value: 34,
                color: 'bg-yellow-500'
              }, {
                label: 'At Risk',
                value: 14,
                color: 'bg-red-500'
              }].map((segment) => (
                <div key={segment.label}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{segment.label}</span>
                    <span>{segment.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className={`${segment.color} h-2 rounded-full`} style={{ width: `${segment.value}%` }} />
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <PieChart size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Focus for the week</p>
                  <p className="text-xs text-blue-800 mt-1">
                    Targeted interventions required on 3 delayed infrastructure projects to avoid cascading impact on service delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
          <CardDescription>AI-generated guidance to accelerate delivery and unlock impact</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{
            title: 'Fast-track critical approvals',
            description: 'Digital ID rollout requires synchronized procurement approvals across 4 ministries within 10 days to stay on track.',
            icon: Target,
            action: 'Escalate to Cabinet'
          }, {
            title: 'Deploy mobile delivery squads',
            description: 'Rural electrification has 6 high-risk feeder lines. Assign cross-functional rapid response teams for each region.',
            icon: AlertCircle,
            action: 'Create Rapid Taskforce'
          }, {
            title: 'Scale community partners',
            description: 'Primary healthcare expansion achieving 92% satisfaction when partnered with local cooperatives. Expand model to 12 new districts.',
            icon: ShieldCheck,
            action: 'Launch Partnership Drive'
          }].map((recommendation) => (
            <div key={recommendation.title} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600">
                <recommendation.icon size={18} />
                <p className="text-sm font-semibold text-gray-900">{recommendation.title}</p>
              </div>
              <p className="mt-2 text-sm text-gray-600">{recommendation.description}</p>
              <Button variant="ghost" className="p-0 mt-3 text-sm text-blue-700">
                {recommendation.action}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <DetailModal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name ?? 'Project Details'}
        maxWidth="xl"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Ministry</p>
                <p className="text-base text-gray-900">{selectedProject.ministry}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${PROJECT_STATUS_COLORS[selectedProject.status]}`}
                >
                  {selectedProject.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Total Budget</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedProject.budget)}</p>
                <p className="text-xs text-gray-500">{formatPercentage((selectedProject.spent / selectedProject.budget) * 100)} spent</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Progress</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProject.milestoneProgress}%</p>
                <p className="text-xs text-gray-500">Milestone completion</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Beneficiaries</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(selectedProject.beneficiaries)}</p>
                <p className="text-xs text-gray-500">Citizens reached</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Risk Level</p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${PROJECT_RISK_COLORS[selectedProject.riskLevel]}`}
              >
                {selectedProject.riskLevel}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Timeline</p>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Start Date</span>
                  <span>{selectedProject.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Completion</span>
                  <span>{selectedProject.endDate}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Project Summary</p>
              <p className="mt-2 text-sm text-gray-700">
                {`${selectedProject.name} is a strategic government initiative led by the ${selectedProject.ministry} ministry. The project currently serves approximately ${formatNumber(selectedProject.beneficiaries)} citizens with a total allocation of ${formatCurrency(selectedProject.budget)}.`}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 rounded-lg border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-blue-900">Delivery Signals</p>
                <ul className="space-y-1 text-sm text-blue-900">
                  <li>• {selectedProject.riskLevel === 'CRITICAL' ? 'Immediate taskforce activation required' : 'Delivery cadence stable with weekly steerco updates'}</li>
                  <li>• {selectedProject.milestoneProgress >= 70 ? 'Momentum on critical path milestones' : 'Acceleration window this month to recover schedule'}</li>
                  <li>• {watchlist.includes(selectedProject.id) ? 'On leadership focus list for cabinet briefing' : 'Recommend adding to focus list for closer tracking'}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-blue-900">Beneficiary Impact</p>
                <ul className="space-y-1 text-sm text-blue-900">
                  <li>• Serving {formatNumber(selectedProject.beneficiaries)} citizens across {selectedProject.location}</li>
                  <li>• Budget utilization at {formatPercentage((selectedProject.spent / selectedProject.budget) * 100)}</li>
                  <li>• Next milestone gate expected {selectedProject.milestoneProgress >= 90 ? 'within 30 days' : 'this quarter'}</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row">
              <Button
                variant={watchlist.includes(selectedProject.id) ? 'government' : 'outline'}
                className="flex-1"
                onClick={() => toggleWatchlist(selectedProject)}
              >
                {watchlist.includes(selectedProject.id) ? 'Remove from Focus List' : 'Add to Focus List'}
              </Button>
              <Button
                variant="government"
                className="flex-1"
                onClick={() => handlePlanOpen(selectedProject)}
                disabled={isPlanGenerating || isPlanRefreshing}
              >
                {isPlanGenerating ? 'Preparing Plan…' : 'View Full Implementation Plan'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isPlanExporting}
                onClick={() => {
                  const plan = planProject && planProject.id === selectedProject.id ? planSummary : planHistory.find((item) => item.projectId === selectedProject.id)
                  setIsPlanExporting(true)
                  setTimeout(() => {
                    downloadPlanBrief(selectedProject, plan ?? undefined)
                    setIsPlanExporting(false)
                  }, 700)
                }}
              >
                {isPlanExporting ? 'Exporting…' : 'Export Project Brief'}
              </Button>
            </div>
          </div>
        )}
      </DetailModal>

      <DetailModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false)
          updateParam('plan', null)
        }}
        title={planProject ? `Implementation Plan: ${planProject.name}` : 'Implementation Plan'}
        maxWidth="2xl"
      >
        {planProject && (
          <div className="space-y-6">
            {isPlanGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Generating comprehensive delivery plan...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_RISK_COLORS[planProject.riskLevel]}`}>
                      {planProject.riskLevel} Risk
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[planProject.status]}`}>
                      {planProject.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPlanRefreshing(true)
                        setTimeout(() => {
                          const refreshedPlan = buildPlanRecord(planProject)
                          setPlanSummary({
                            summary: refreshedPlan.summary,
                            milestones: refreshedPlan.milestones,
                            support: refreshedPlan.support,
                            nextSteps: refreshedPlan.nextSteps,
                            updatedAt: refreshedPlan.updatedAt,
                          })
                          setPlanHistory((prev) => {
                            const withoutCurrent = prev.filter((item) => item.projectId !== planProject.id)
                            const nextHistory = [refreshedPlan, ...withoutCurrent].slice(0, 8)
                            localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(nextHistory))
                            return nextHistory
                          })
                          setIsPlanRefreshing(false)
                          toast.success('Plan refreshed', {
                            description: 'Updated with latest project data',
                          })
                        }, 1200)
                      }}
                      disabled={isPlanRefreshing}
                    >
                      {isPlanRefreshing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        'Refresh Plan'
                      )}
                    </Button>
                    <Button
                      variant="government"
                      size="sm"
                      onClick={() => handleAnalyze(planProject)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Send to AI Assistant
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Budget</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(planProject.budget)}</p>
                    <p className="text-xs text-gray-500">{formatPercentage((planProject.spent / planProject.budget) * 100)} spent</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Progress</p>
                    <p className="text-lg font-semibold text-gray-900">{planProject.milestoneProgress}%</p>
                    <p className="text-xs text-gray-500">Milestone completion</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Beneficiaries</p>
                    <p className="text-lg font-semibold text-gray-900">{formatNumber(planProject.beneficiaries)}</p>
                    <p className="text-xs text-gray-500">Citizens impacted</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Plan Summary</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{planSummary.summary}</p>
                  </div>

                  {planSummary.milestones.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Next Milestones</h3>
                      </div>
                      <ul className="space-y-2">
                        {planSummary.milestones.map((milestone, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-green-600" />
                            <span className="text-sm text-gray-700">{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {planSummary.support.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Support Needed</h3>
                      </div>
                      <ul className="space-y-2">
                        {planSummary.support.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-amber-600" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {planSummary.nextSteps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Immediate Next Steps</h3>
                      </div>
                      <ul className="space-y-2">
                        {planSummary.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {planSummary.updatedAt && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Plan last updated: {new Date(planSummary.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {planHistory.length > 1 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Plan History</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {planHistory.slice(0, 5).map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => {
                            const project = projects.find((p) => p.id === record.projectId)
                            if (project) handlePlanOpen(project)
                          }}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{record.projectName}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(record.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{record.summary}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => downloadPlanBrief(planProject, planSummary)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Plan Brief
                  </Button>
                  <Button
                    variant="government"
                    className="flex-1"
                    onClick={() => {
                      handleAnalyze(planProject)
                      setIsPlanModalOpen(false)
                      updateParam('plan', null)
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Collaborate with AI
                  </Button>
                </div>
              </>
            )}
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
            <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      statuses: prev.statuses.includes(status)
                        ? prev.statuses.filter((s) => s !== status)
                        : [...prev.statuses, status],
                    }))
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    filters.statuses.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Risk Level</label>
            <div className="flex flex-wrap gap-2">
              {RISK_OPTIONS.map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      riskLevels: prev.riskLevels.includes(risk)
                        ? prev.riskLevels.filter((r) => r !== risk)
                        : [...prev.riskLevels, risk],
                    }))
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    filters.riskLevels.includes(risk)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Ministry</label>
            <div className="flex flex-wrap gap-2">
              {MINISTRIES.map((ministry) => (
                <button
                  key={ministry}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      ministries: prev.ministries.includes(ministry)
                        ? prev.ministries.filter((m) => m !== ministry)
                        : [...prev.ministries, ministry],
                    }))
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    filters.ministries.includes(ministry)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {ministry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Progress Range: {filters.minProgress}% - {filters.maxProgress}%
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Minimum Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minProgress}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setFilters((prev) => ({
                      ...prev,
                      minProgress: value,
                      maxProgress: Math.max(value, prev.maxProgress),
                    }))
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Maximum Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.maxProgress}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setFilters((prev) => ({
                      ...prev,
                      maxProgress: value,
                      minProgress: Math.min(value, prev.minProgress),
                    }))
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFilters(DEFAULT_FILTERS)
                toast.success('Filters cleared')
              }}
            >
              Clear All
            </Button>
            <Button
              variant="government"
              className="flex-1"
              onClick={() => {
                setIsFilterModalOpen(false)
                toast.success('Filters applied', {
                  description: `${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}`,
                })
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DetailModal>
    </div>
  )
}


