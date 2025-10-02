'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DetailModal } from '@/components/ui/detail-modal'
import {
  Building2,
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  PieChart,
  ShieldCheck,
  Target
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

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

interface ProjectsOverviewProps {
  className?: string
}

export default function ProjectsOverview({ className }: ProjectsOverviewProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const totals = useMemo(() => {
    if (!projects.length) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        projectsAtRisk: 0,
        completionRate: 0
      }
    }

    const totalBudget = projects.reduce((acc, project) => acc + project.budget, 0)
    const totalSpent = projects.reduce((acc, project) => acc + project.spent, 0)
    const projectsAtRisk = projects.filter(project => ['HIGH', 'CRITICAL'].includes(project.riskLevel)).length
    const completionRate = Math.round(
      projects.reduce((acc, project) => acc + project.milestoneProgress, 0) / projects.length
    )

    return { totalBudget, totalSpent, projectsAtRisk, completionRate }
  }, [projects])

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

  const highImpactProjects = projects
    .filter(project => project.milestoneProgress >= 60)
    .sort((a, b) => b.milestoneProgress - a.milestoneProgress)
    .slice(0, 3)

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strategic Projects Portfolio</h1>
          <p className="text-gray-600 mt-1">Monitor execution, risk, and impact across priority government initiatives</p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Advanced Filters
          </Button>
          <Button variant="government" className="flex items-center gap-2">
            <ArrowUpRight size={16} />
            New Project Brief
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Budget</p>
                <p className="text-xl font-bold">{formatCurrency(totals.totalBudget)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Across {formatNumber(projects.length)} strategic projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Progress</p>
                <p className="text-xl font-bold">{formatPercentage(totals.completionRate)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Average milestone completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Projects At Risk</p>
                <p className="text-xl font-bold">{formatNumber(totals.projectsAtRisk)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Weekly trend: +1 vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Beneficiaries Reached</p>
                <p className="text-xl font-bold">
                  {formatNumber(projects.reduce((acc, project) => acc + project.beneficiaries, 0))}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Directly impacted citizens</p>
          </CardContent>
        </Card>
      </div>

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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedProject(project)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {project.location}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{project.ministry}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{formatCurrency(project.budget)}</div>
                      <div className="text-xs text-gray-500">{formatPercentage((project.spent / project.budget) * 100)} spent</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROJECT_RISK_COLORS[project.riskLevel]}`}>
                        {project.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
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

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row">
              <Button variant="government" className="flex-1">
                View Full Implementation Plan
              </Button>
              <Button variant="outline" className="flex-1">
                Export Project Brief
              </Button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  )
}


