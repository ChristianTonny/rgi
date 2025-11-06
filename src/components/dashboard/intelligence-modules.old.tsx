'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
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
  Activity,
  LineChart,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'
import type { IntelligenceModule } from '@/types'

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
      nisrData: {
        povertyRate: 38.2,
        source: 'EICV5',
        year: 2024,
      },
    },
    insights: [
      {
        id: 'resource-insight-1',
        type: 'TREND',
        title: 'Execution accelerating in rural electrification',
        description: 'Reallocation into precision irrigation lifted execution +3.2pp in Eastern Province.',
        confidence: 82,
        impact: 'HIGH',
        actionRequired: true,
        relatedData: ['NISR:EICV5:2024', 'Budget:Reallocation:2025Q3'],
        createdAt: new Date(),
      },
      {
        id: 'resource-insight-2',
        type: 'RECOMMENDATION',
        title: 'Expand contingency support to youth skilling',
        description: 'Absorption gaps narrowed after channeling RF 120M into Innovation City apprenticeships.',
        confidence: 76,
        impact: 'MEDIUM',
        actionRequired: false,
        relatedData: ['NISR:YouthEmployment:2025Q2'],
        createdAt: new Date(),
      },
    ],
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
      nisrData: {
        gdpGrowth: 8.1,
        source: 'National Accounts',
        year: 2024,
      },
    },
    insights: [
      {
        id: 'opportunity-insight-1',
        type: 'OPPORTUNITY',
        title: 'Green energy pipeline dominates investor interest',
        description: 'RF 620B in private commitments are concentrated around storage-backed solar parks.',
        confidence: 79,
        impact: 'HIGH',
        actionRequired: true,
        relatedData: ['RDB:InvestorPipeline:2025-09'],
        createdAt: new Date(),
      },
      {
        id: 'opportunity-insight-2',
        type: 'TREND',
        title: 'Agrifood value-add projects gaining momentum',
        description: 'Cold chain exports out of Nyagatare up 14% after incentives from MINAGRI.',
        confidence: 71,
        impact: 'MEDIUM',
        actionRequired: false,
        relatedData: ['NISR:AgricultureExports:2025H1'],
        createdAt: new Date(),
      },
    ],
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
      nisrData: {
        youthUnemployment: 21.4,
        source: 'LFS Q2',
        year: 2024,
      },
    },
    insights: [
      {
        id: 'performance-insight-1',
        type: 'ALERT',
        title: 'Eastern corridor roadworks remain watchlist items',
        description: 'Right-of-way compensation delays persist across three districts; delivery unit escalation advised.',
        confidence: 74,
        impact: 'HIGH',
        actionRequired: true,
        relatedData: ['PMDU:DeliveryWatchlist:2025-09'],
        createdAt: new Date(),
      },
      {
        id: 'performance-insight-2',
        type: 'TREND',
        title: 'Youth skilling projects improving milestone velocity',
        description: 'Innovation City cohorts now achieving 92% milestone completion within SLA.',
        confidence: 68,
        impact: 'MEDIUM',
        actionRequired: false,
        relatedData: ['NISR:LabourForce:2025Q2'],
        createdAt: new Date(),
      },
    ],
  },
]

const DEMO_CHARTS = {
  budgetExecution: [
    { month: 'Jan', executed: 32, plan: 28 },
    { month: 'Feb', executed: 45, plan: 42 },
    { month: 'Mar', executed: 51, plan: 48 },
    { month: 'Apr', executed: 62, plan: 58 },
    { month: 'May', executed: 70, plan: 66 },
    { month: 'Jun', executed: 76, plan: 74 },
  ],
  fundingShare: [
    { name: 'Education', value: 22 },
    { name: 'Health', value: 18 },
    { name: 'Infrastructure', value: 27 },
    { name: 'Agriculture', value: 14 },
    { name: 'ICT', value: 9 },
  ],
  projectStatus: [
    { status: 'On Track', count: 26 },
    { status: 'Delayed', count: 10 },
    { status: 'At Risk', count: 6 },
  ],
  opportunityTrend: [
    { quarter: 'Q1', value: 14 },
    { quarter: 'Q2', value: 18 },
    { quarter: 'Q3', value: 21 },
    { quarter: 'Q4', value: 25 },
  ],
}

const DEMO_ACTIVITIES: DashboardActivity[] = [
  {
    id: 'activity-1',
    title: 'Budget reallocation approved for Smart Agriculture program',
    badgeColor: 'bg-green-500',
    type: 'budget',
    ministry: 'Agriculture',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'activity-2',
    title: 'Infrastructure audit flagged three projects for review',
    badgeColor: 'bg-yellow-500',
    type: 'risk',
    ministry: 'Infrastructure',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'activity-3',
    title: 'Investor interest confirmed for Kigali Innovation Hub',
    badgeColor: 'bg-blue-500',
    type: 'investment',
    ministry: 'RDB',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: 'activity-4',
    title: 'Healthcare expansion milestone reached 80% coverage',
    badgeColor: 'bg-emerald-500',
    type: 'delivery',
    ministry: 'Health',
    timestamp: new Date(Date.now() - 47 * 60 * 1000),
  },
  {
    id: 'activity-5',
    title: 'Emergency response fund triggered for flood relief',
    badgeColor: 'bg-red-500',
    type: 'alert',
    ministry: 'MINEMA',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 'activity-6',
    title: 'Cabinet briefing scheduled for AI in public services',
    badgeColor: 'bg-indigo-500',
    type: 'briefing',
    ministry: 'ICT & Innovation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'activity-7',
    title: 'Youth apprenticeship placements exceeded quarterly target',
    badgeColor: 'bg-sky-500',
    type: 'delivery',
    ministry: 'Youth & Sports',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'activity-8',
    title: 'RF 120B concession signed for Nyagatare solar storage',
    badgeColor: 'bg-blue-400',
    type: 'investment',
    ministry: 'Energy',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'activity-9',
    title: 'Rapid Delivery Taskforce cleared procurement backlog',
    badgeColor: 'bg-amber-500',
    type: 'risk',
    ministry: "Prime Minister's Office",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'activity-10',
    title: 'NISR released updated poverty microdata for Eastern Province',
    badgeColor: 'bg-purple-500',
    type: 'briefing',
    ministry: 'NISR',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
  },
]

type DashboardActivity = {
  id: string
  title: string
  badgeColor: string
  type: 'budget' | 'risk' | 'investment' | 'delivery' | 'alert' | 'briefing'
  ministry: string
  timestamp: Date
}

const BUDGET_EXPORT_DATA = [
  { Ministry: 'Finance', Program: 'Fiscal Stability Support', Allocated: 'RF 1,250,000,000', Reallocated: 'RF 80,000,000', YTD_Spend: 'RF 940,000,000', Variance: 'RF 150,000,000', Execution: '75%', Alert: 'Monitor absorption' },
  { Ministry: 'ICT & Innovation', Program: 'GovStack Platform', Allocated: 'RF 620,000,000', Reallocated: 'RF 45,000,000', YTD_Spend: 'RF 510,000,000', Variance: 'RF 65,000,000', Execution: '82%', Alert: 'Talent augmentation required' },
  { Ministry: 'Infrastructure', Program: 'Eastern Corridor Roads', Allocated: 'RF 2,100,000,000', Reallocated: 'RF 180,000,000', YTD_Spend: 'RF 1,760,000,000', Variance: 'RF 160,000,000', Execution: '84%', Alert: 'Land compensation risk' },
  { Ministry: 'Health', Program: 'Primary Care Expansion', Allocated: 'RF 980,000,000', Reallocated: 'RF 60,000,000', YTD_Spend: 'RF 730,000,000', Variance: 'RF 120,000,000', Execution: '74%', Alert: 'Procurement lead times' },
  { Ministry: 'Education', Program: 'STEM Excellence Centers', Allocated: 'RF 720,000,000', Reallocated: 'RF 25,000,000', YTD_Spend: 'RF 540,000,000', Variance: 'RF 90,000,000', Execution: '75%', Alert: 'Device supply chain' },
  { Ministry: 'Agriculture', Program: 'Climate Smart Irrigation', Allocated: 'RF 860,000,000', Reallocated: 'RF 40,000,000', YTD_Spend: 'RF 610,000,000', Variance: 'RF 110,000,000', Execution: '71%', Alert: 'Solar pump procurement' },
  { Ministry: 'Energy', Program: 'Lake Kivu Methane Expansion', Allocated: 'RF 1,300,000,000', Reallocated: 'RF 55,000,000', YTD_Spend: 'RF 920,000,000', Variance: 'RF 120,000,000', Execution: '71%', Alert: 'Environmental approvals' },
  { Ministry: 'Urbanisation', Program: 'Smart Cities Blueprint', Allocated: 'RF 540,000,000', Reallocated: 'RF 32,000,000', YTD_Spend: 'RF 360,000,000', Variance: 'RF 80,000,000', Execution: '67%', Alert: 'PPP structuring support' },
  { Ministry: 'Tourism & Culture', Program: 'Heritage Upgrade', Allocated: 'RF 410,000,000', Reallocated: 'RF 18,000,000', YTD_Spend: 'RF 290,000,000', Variance: 'RF 45,000,000', Execution: '71%', Alert: 'Site readiness checks' },
  { Ministry: 'Youth & Sports', Program: 'National Innovation Fund', Allocated: 'RF 310,000,000', Reallocated: 'RF 22,000,000', YTD_Spend: 'RF 225,000,000', Variance: 'RF 63,000,000', Execution: '73%', Alert: 'Investor onboarding' }
]

const MINISTRY_PERFORMANCE_EXPORT = [
  { Ministry: 'ICT & Innovation', Strategic_Pillars: 'Digital Services; GovCloud; Cybersecurity', Delivery_Score: '89%', KPI_Trend: 'Improving', Flagged_Initiatives: 1, Requires_Support: 'Data Governance Policy', Cabinet_Note: 'Unlock talent pipeline for API squad' },
  { Ministry: 'Health', Strategic_Pillars: 'Primary Care; Telemedicine; Community Health', Delivery_Score: '86%', KPI_Trend: 'Stable', Flagged_Initiatives: 2, Requires_Support: 'HR Deployment', Cabinet_Note: 'Coordinate oxygen plant rollout' },
  { Ministry: 'Education', Strategic_Pillars: 'Foundational Skills; TVET; STEM', Delivery_Score: '78%', KPI_Trend: 'Improving', Flagged_Initiatives: 3, Requires_Support: 'Device Procurement', Cabinet_Note: 'Escalate customs clearance for tablets' },
  { Ministry: 'Finance', Strategic_Pillars: 'Revenue Mobilisation; Expenditure Control', Delivery_Score: '91%', KPI_Trend: 'Improving', Flagged_Initiatives: 0, Requires_Support: 'None', Cabinet_Note: 'Lead fiscal risk committee' },
  { Ministry: 'Infrastructure', Strategic_Pillars: 'Roads; Mobility; Logistics Hubs', Delivery_Score: '74%', KPI_Trend: 'Declining', Flagged_Initiatives: 4, Requires_Support: 'Risk Taskforce', Cabinet_Note: 'Resolve ROW compensation backlog' },
  { Ministry: 'Energy', Strategic_Pillars: 'Generation; Distribution; Off-grid', Delivery_Score: '82%', KPI_Trend: 'Improving', Flagged_Initiatives: 1, Requires_Support: 'IPP Approvals', Cabinet_Note: 'Accelerate mini-grid licensing' },
  { Ministry: 'Agriculture', Strategic_Pillars: 'Value Chains; Irrigation; Agro-processing', Delivery_Score: '80%', KPI_Trend: 'Stable', Flagged_Initiatives: 2, Requires_Support: 'Weather Data', Cabinet_Note: 'Coordinate with Meteorology Agency' },
  { Ministry: 'Urbanisation', Strategic_Pillars: 'Smart Cities; Affordable Housing; Green Mobility', Delivery_Score: '76%', KPI_Trend: 'Improving', Flagged_Initiatives: 1, Requires_Support: 'PPP Structuring', Cabinet_Note: 'Agree on blended finance instrument' },
  { Ministry: 'Tourism & Culture', Strategic_Pillars: 'Heritage; Experience Economy; Events', Delivery_Score: '81%', KPI_Trend: 'Stable', Flagged_Initiatives: 1, Requires_Support: 'Marketing push', Cabinet_Note: 'Align 2026 summit pipeline' },
  { Ministry: 'Youth & Sports', Strategic_Pillars: 'Innovation; Sports Infrastructure', Delivery_Score: '83%', KPI_Trend: 'Improving', Flagged_Initiatives: 0, Requires_Support: 'Investor Matchmaking', Cabinet_Note: 'Highlight fund success stories' }
]

const PROJECT_STATUS_EXPORT = [
  { Project: 'Rural Electrification Phase 3', Ministry: 'Energy', Budget: 'RF 2,150,000,000', Spent: 'RF 1,680,000,000', Progress: '78%', Risk: 'Medium', Last_Update: '2025-09-12', Key_Issues: 'Transformer delays at Rusizi substation', Next_Milestone: 'Commission 240 sites (Nov)', Sponsor: 'Permanent Secretary - Energy', Delivery_Partner: 'EDCL' },
  { Project: 'GovStack Platform Rollout', Ministry: 'ICT & Innovation', Budget: 'RF 620,000,000', Spent: 'RF 410,000,000', Progress: '65%', Risk: 'Low', Last_Update: '2025-09-10', Key_Issues: 'Talent gaps in API squad', Next_Milestone: 'Digital ID integration (Oct)', Sponsor: 'DG - Digital Transformation', Delivery_Partner: 'Irembo' },
  { Project: 'Primary Healthcare Expansion', Ministry: 'Health', Budget: 'RF 980,000,000', Spent: 'RF 760,000,000', Progress: '82%', Risk: 'Low', Last_Update: '2025-09-06', Key_Issues: 'Logistics for equipment distribution', Next_Milestone: 'Open 25 clinics (Dec)', Sponsor: 'DG - Clinical Services', Delivery_Partner: 'Rwanda Biomedical Centre' },
  { Project: 'Eastern Corridor Roads', Ministry: 'Infrastructure', Budget: 'RF 2,400,000,000', Spent: 'RF 1,920,000,000', Progress: '71%', Risk: 'High', Last_Update: '2025-09-04', Key_Issues: 'Right-of-way compensation', Next_Milestone: 'Bridge pilings complete (Nov)', Sponsor: 'DG - Transport', Delivery_Partner: 'China Road & Bridge' },
  { Project: 'Smart Agriculture Irrigation', Ministry: 'Agriculture', Budget: 'RF 860,000,000', Spent: 'RF 540,000,000', Progress: '63%', Risk: 'Medium', Last_Update: '2025-09-14', Key_Issues: 'Solar pump procurement timeline', Next_Milestone: 'Commission 12 irrigation hubs (Oct)', Sponsor: 'DG - Irrigation & Mechanisation', Delivery_Partner: 'AgriTech Consortium' },
  { Project: 'Kigali Bus Rapid Transit', Ministry: 'Infrastructure', Budget: 'RF 1,650,000,000', Spent: 'RF 1,120,000,000', Progress: '66%', Risk: 'High', Last_Update: '2025-09-07', Key_Issues: 'Depot construction lagging', Next_Milestone: 'Complete corridor paving (Dec)', Sponsor: 'DG - Urban Planning', Delivery_Partner: 'AECOM / City of Kigali' },
  { Project: 'Lake Kivu Methane Expansion', Ministry: 'Energy', Budget: 'RF 1,300,000,000', Spent: 'RF 940,000,000', Progress: '72%', Risk: 'Medium', Last_Update: '2025-09-05', Key_Issues: 'Environmental approvals', Next_Milestone: 'Install safety systems (Oct)', Sponsor: 'DG - Generation', Delivery_Partner: 'Symbion Power' },
  { Project: 'Nationwide e-Learning Devices', Ministry: 'Education', Budget: 'RF 780,000,000', Spent: 'RF 480,000,000', Progress: '58%', Risk: 'Medium', Last_Update: '2025-09-08', Key_Issues: 'Customs clearance delays', Next_Milestone: 'Deliver 45,000 tablets (Nov)', Sponsor: 'DG - ICT in Education', Delivery_Partner: 'Positivo BGH' },
  { Project: 'National Innovation Fund', Ministry: 'Youth & Sports', Budget: 'RF 310,000,000', Spent: 'RF 225,000,000', Progress: '73%', Risk: 'Low', Last_Update: '2025-09-09', Key_Issues: 'Investor pipeline expansion', Next_Milestone: 'Approve 12 start-ups (Oct)', Sponsor: 'DG - Innovation', Delivery_Partner: 'Development Bank of Rwanda' },
  { Project: 'Heritage Site Upgrades', Ministry: 'Tourism & Culture', Budget: 'RF 410,000,000', Spent: 'RF 290,000,000', Progress: '71%', Risk: 'Low', Last_Update: '2025-09-11', Key_Issues: 'Site readiness checks', Next_Milestone: 'Complete visitor centre refurb (Dec)', Sponsor: 'DG - Culture', Delivery_Partner: 'Rwanda Heritage Trust' }
]

const DASHBOARD_SNAPSHOT_EXPORT = [
  { Module: 'Resource Allocation', Priority: 'High', Updated: '2025-09-15 08:30', Primary_Metric: 'RF 5,000,000,000 total budget', Insight: 'Budget execution at 87.5% with targeted reallocations', Owner: 'Budget Steering Committee' },
  { Module: 'Opportunity Radar', Priority: 'High', Updated: '2025-09-15 08:30', Primary_Metric: '45 opportunities with RF 2.5B value', Insight: '12 high-priority investments across energy and agro-processing', Owner: 'Investment Facilitation Office' },
  { Module: 'Performance Monitor', Priority: 'Medium', Updated: '2025-09-15 08:30', Primary_Metric: '78.5% on-time delivery rate', Insight: '8 projects require risk mitigation; focus on infrastructure corridor', Owner: 'Delivery Unit' }
]

export default function IntelligenceModules({ className }: IntelligenceModulesProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [modules, setModules] = useState<IntelligenceModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nisrModal, setNisrModal] = useState<{ isOpen: boolean; data: any | null }>({ isOpen: false, data: null })
  const [charts, setCharts] = useState(DEMO_CHARTS)
  const [activities, setActivities] = useState<DashboardActivity[]>(DEMO_ACTIVITIES.slice(0, 6))
  const [activityFilter, setActivityFilter] = useState<'all' | DashboardActivity['type']>('all')
  const [selectedTrend, setSelectedTrend] = useState<'budget' | 'opportunities'>('budget')
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false)
  const [trendModalDataset, setTrendModalDataset] = useState<any[]>([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    title: 'Executive Intelligence Briefing',
    date: '',
    recipients: 'Cabinet Committee on ICT & Infrastructure',
    notes: 'Focus on funding execution, at-risk projects, and investor pipeline.',
  })
  const [isViewAllActivitiesOpen, setIsViewAllActivitiesOpen] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const tailoredModules = DEMO_MODULES.map((module) => ({
          ...module,
        lastUpdated: new Date(),
        }))

      setModules(tailoredModules)
          setError(null)
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!modules.length) return
    const interval = setInterval(() => {
      setActivities((prev) => {
        const candidate = { ...DEMO_ACTIVITIES[Math.floor(Math.random() * DEMO_ACTIVITIES.length)], id: `activity-${Date.now()}`, timestamp: new Date() }
        return [candidate, ...prev].slice(0, 8)
      })
    }, 30_000)

    return () => clearInterval(interval)
  }, [modules.length])

  useEffect(() => {
    if (!modules.length) return
    const interval = setInterval(() => {
      setCharts((previous) => ({
        ...previous,
        budgetExecution: previous.budgetExecution.map((point, index) => ({
          ...point,
          executed: Math.max(20, Math.min(90, point.executed + (Math.random() * 6 - 3))),
          plan: Math.max(20, Math.min(90, point.plan + (Math.random() * 4 - 2))),
        })),
        opportunityTrend: previous.opportunityTrend.map((point) => ({
          ...point,
          value: Math.max(10, Math.min(30, point.value + (Math.random() * 4 - 2))),
        })),
      }))
    }, 45_000)

    return () => clearInterval(interval)
  }, [modules.length])

  const showSourceModal = (data: any) => setNisrModal({ isOpen: true, data })

  const renderResourceAllocation = (module: IntelligenceModule) => {
    const data = module.data
    const efficiency = data.efficiency
    const available = data.available
    const spent = data.spent
    const totalBudget = data.totalBudget
    const topInsight = module.insights?.[0]

    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg">Resource Allocation</CardTitle>
              <CardDescription className="text-xs md:text-sm">Budget efficiency and recommendations</CardDescription>
            </div>
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600 shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Budget</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Available</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(available)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(spent / totalBudget) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">{formatPercentage(efficiency)}</span>
            </div>
            {data.nisrData && (
              <button
                type="button"
                onClick={() => showSourceModal(data.nisrData)}
                className="text-xs text-blue-600 hover:underline mt-1 md:mt-2 cursor-pointer"
              >
                📊 Poverty rate: {data.nisrData.povertyRate}% (NISR {data.nisrData.source} {data.nisrData.year})
              </button>
            )}
            {topInsight && (
              <div className="mt-3 rounded-md border border-green-100 bg-green-50 p-3">
                <p className="text-xs uppercase text-green-700 font-semibold tracking-wide">Headline</p>
                <p className="text-sm font-medium text-green-900">{topInsight.title}</p>
                <p className="text-xs text-green-800 mt-1 leading-relaxed">{topInsight.description}</p>
              </div>
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
    const topInsight = module.insights?.[0]

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
            {topInsight && (
              <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs uppercase text-blue-700 font-semibold tracking-wide">Priority Move</p>
                <p className="text-sm font-medium text-blue-900">{topInsight.title}</p>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">{topInsight.description}</p>
              </div>
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
    const topInsight = module.insights?.[0]

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
            {topInsight && (
              <div className="mt-3 rounded-md border border-yellow-100 bg-yellow-50 p-3">
                <p className="text-xs uppercase text-yellow-700 font-semibold tracking-wide">Watchlist</p>
                <p className="text-sm font-medium text-yellow-900">{topInsight.title}</p>
                <p className="text-xs text-yellow-800 mt-1 leading-relaxed">{topInsight.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderLoading = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Card key={`skeleton-${i}`} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
            <div className="h-24 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
      ))}
    </div>
  )

  if (isLoading) {
    return renderLoading()
  }

  if (error) {
  return (
      <Card className={`border border-red-200 bg-red-50 ${className ?? ''}`}>
        <CardHeader className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-base text-red-700">Intelligence data is temporarily unavailable</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
    )
  }

  const renderCharts = () => (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Budget Execution</CardTitle>
              <CardDescription>Monthly budget execution versus plan</CardDescription>
            </div>
            <LineChart className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsLineChart data={charts.budgetExecution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(val) => `${val}%`} />
              <Tooltip />
              <Line type="monotone" dataKey="executed" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="plan" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Funding Share</CardTitle>
              <CardDescription>Allocation by strategic sector</CardDescription>
            </div>
            <PieChartIcon className="h-6 w-6 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={charts.fundingShare} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                {charts.fundingShare.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={["#2563eb", "#16a34a", "#f97316", "#f59e0b", "#a855f7"][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Project Status Overview</CardTitle>
              <CardDescription>Delivery distribution across the portfolio</CardDescription>
            </div>
            <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={charts.projectStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {charts.projectStatus.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#16a34a", "#f97316", "#ef4444"][index % 3]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Opportunity Pipeline</CardTitle>
              <CardDescription>Investable ventures emerging each quarter</CardDescription>
            </div>
            <Activity className="h-6 w-6 text-rose-600" />
              </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts.opportunityTrend}>
              <defs>
                <linearGradient id="areaOpportunity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ede9fe" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#areaOpportunity)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )

  const renderQuickActions = (moduleData: IntelligenceModule[]) => (
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common government intelligence tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
          <Button
            variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                const toastId = toast.loading('Pulling ministry budget execution...')
                await new Promise((resolve) => setTimeout(resolve, 5000))
                exportToCSV(BUDGET_EXPORT_DATA, `budget_report_${new Date().toISOString().split('T')[0]}`)
              toast.success('Budget report generated', {
                  id: toastId,
                  description: `Workbook prepared with ${BUDGET_EXPORT_DATA.length} ministry records`,
              })
            }}
          >
            <Zap size={16} className="mr-2" />
            Generate Budget Report
          </Button>
            <p className="mt-2 text-xs text-gray-500">Creates an allocation vs spend ledger with variance and risk commentary for every ministry program.</p>
          </div>
          <div>
          <Button
            variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                const toastId = toast.loading('Compiling ministry performance dossier...')
                await new Promise((resolve) => setTimeout(resolve, 5000))
                exportToCSV(MINISTRY_PERFORMANCE_EXPORT, `ministry_performance_${new Date().toISOString().split('T')[0]}`)
              toast.success('Ministry performance review generated', {
                  id: toastId,
                  description: `Performance brief exported with ${MINISTRY_PERFORMANCE_EXPORT.length} ministries`,
              })
            }}
          >
            <Users size={16} className="mr-2" />
            Ministry Performance Review
          </Button>
            <p className="mt-2 text-xs text-gray-500">Downloads strategic pillar coverage, KPI trends, escalation notes, and cabinet talking points.</p>
          </div>
          <div>
          <Button
            variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                const toastId = toast.loading('Syncing flagship project milestones...')
                await new Promise((resolve) => setTimeout(resolve, 5000))
                exportToCSV(PROJECT_STATUS_EXPORT, `project_status_${new Date().toISOString().split('T')[0]}`)
                toast.success('Project status update exported', {
                  id: toastId,
                  description: `Delivery dashboard prepared for ${PROJECT_STATUS_EXPORT.length} projects`,
              })
            }}
          >
            <CheckCircle size={16} className="mr-2" />
            Project Status Update
          </Button>
            <p className="mt-2 text-xs text-gray-500">Includes budget, spend, milestones, blockers, sponsors, and delivery partners for top initiatives.</p>
          </div>
          <div>
          <Button
            variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                const toastId = toast.loading('Preparing dashboard snapshot...')
                await new Promise((resolve) => setTimeout(resolve, 5000))
                const snapshot = moduleData.map((module) => ({
                  Module: module.title,
                Priority: module.priority,
                  Updated: module.lastUpdated.toLocaleString(),
                  Primary_Metric: module.type === 'resource-allocation'
                    ? formatCurrency(module.data.totalBudget)
                    : module.type === 'opportunity-radar'
                    ? `${module.data.totalOpportunities} opportunities`
                    : `${formatPercentage(module.data.onTimeDelivery)} on-time`,
                  Insight: module.type === 'resource-allocation'
                    ? 'Budget execution trending positively with targeted reallocations'
                    : module.type === 'opportunity-radar'
                    ? 'Investor demand clustering around renewable energy and agro-value chains'
                    : 'Risk mitigation required for infrastructure corridor projects',
                }))

                exportToCSV(DASHBOARD_SNAPSHOT_EXPORT.concat(snapshot), 'dashboard_snapshot')
              toast.success('Dashboard snapshot exported', {
                  id: toastId,
                  description: `Snapshot shared with ${snapshot.length} intelligence cards summarized`,
              })
            }}
          >
            <TrendingUp size={16} className="mr-2" />
            Export Dashboard Snapshot
          </Button>
            <p className="mt-2 text-xs text-gray-500">Captures current intelligence cards with narrative insight and executive owners for briefing packs.</p>
          </div>
        </CardContent>
      </Card>
  )

  const filteredActivities = activities.filter((activity) => activityFilter === 'all' || activity.type === activityFilter)

  const getRelativeTime = (timestamp: Date) => {
    const diffMs = Date.now() - timestamp.getTime()
    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const renderActivity = () => (
      <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest intelligence signals across ministries</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600" onClick={() => setIsViewAllActivitiesOpen(true)}>
            View all
          </Button>
              </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[{ label: 'All', value: 'all' }, { label: 'Budget', value: 'budget' }, { label: 'Risk', value: 'risk' }, { label: 'Delivery', value: 'delivery' }, { label: 'Investment', value: 'investment' }, { label: 'Alert', value: 'alert' }, { label: 'Briefings', value: 'briefing' }].map((filter) => (
            <button
              key={filter.value}
              className={`rounded-full border px-3 py-1 ${activityFilter === filter.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600'}`}
              onClick={() => setActivityFilter(filter.value as typeof activityFilter)}
            >
              {filter.label}
            </button>
          ))}
            </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredActivities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`mt-1 h-2 w-2 rounded-full ${activity.badgeColor}`}></div>
              <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <span className="text-xs text-gray-400">{getRelativeTime(activity.timestamp)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">{activity.type}</span>
                <span>{activity.ministry}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredActivities.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-200 p-4 text-xs text-gray-500">
            No activity for this filter yet. Try switching categories.
          </div>
        )}
        </CardContent>
      </Card>
  )

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id}>
            {module.type === 'resource-allocation' && renderResourceAllocation(module)}
            {module.type === 'opportunity-radar' && renderOpportunityRadar(module)}
            {module.type === 'performance-monitor' && renderPerformanceMonitor(module)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderCharts()}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderQuickActions(modules)}
        {renderActivity()}
      </div>

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
              <div>
                <p className="text-gray-600">Reliability</p>
                <p className="font-medium">{nisrModal.data.reliability ?? 'High'}</p>
            </div>
            {nisrModal.data.url && (
              <a
                href={nisrModal.data.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Visit dataset
              </a>
            )}
          </div>
        )}
      </DetailModal>

      <DetailModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        title={selectedTrend === 'budget' ? 'Budget Execution Trend' : 'Opportunity Trend'}
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {selectedTrend === 'budget' ? (
              <RechartsLineChart data={trendModalDataset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="executed" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="plan" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </RechartsLineChart>
            ) : (
              <AreaChart data={trendModalDataset}>
                <defs>
                  <linearGradient id="modalOpportunity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ede9fe" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#modalOpportunity)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </DetailModal>

      <DetailModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule executive briefing"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Briefing title</label>
            <input
              type="text"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Date & time</label>
            <input
              type="datetime-local"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Recipients</label>
            <input
              type="text"
              value={scheduleForm.recipients}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, recipients: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Notes for intelligence team</label>
            <textarea
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast.success('Briefing scheduled with intelligence team')
                setIsScheduleModalOpen(false)
              }}
            >
              Save & notify
            </Button>
          </div>
        </div>
      </DetailModal>

      <DetailModal
        isOpen={isViewAllActivitiesOpen}
        onClose={() => setIsViewAllActivitiesOpen(false)}
        title="All recent activity"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {DEMO_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-none">
              <span className={`mt-1 h-2 w-2 rounded-full ${activity.badgeColor}`}></span>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </DetailModal>
    </div>
  )
}

