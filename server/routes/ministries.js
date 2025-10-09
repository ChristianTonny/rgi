const express = require('express')
const { authenticateToken } = require('./auth')

const router = express.Router()

// Mock ministries data
const mockMinistries = [
  {
    id: 'min-1',
    code: 'MININFRA',
    name: 'Ministry of Infrastructure',
    budget: 8000000000,
    spent: 6800000000,
    projects: 12,
    efficiency: 92.5,
  },
  {
    id: 'min-2',
    code: 'MINICT',
    name: 'Ministry of ICT and Innovation',
    budget: 5000000000,
    spent: 4200000000,
    projects: 8,
    efficiency: 88.0,
  },
  {
    id: 'min-3',
    code: 'MOH',
    name: 'Ministry of Health',
    budget: 6000000000,
    spent: 5100000000,
    projects: 10,
    efficiency: 85.2,
  },
  {
    id: 'min-4',
    code: 'MINEDUC',
    name: 'Ministry of Education',
    budget: 4000000000,
    spent: 3456000000,
    projects: 12,
    efficiency: 87.8,
  },
]

// GET /api/ministries - List all ministries
router.get('/', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    data: mockMinistries,
    total: mockMinistries.length,
  })
})

// GET /api/ministries/:id/implementation-plan - View implementation plan
router.get('/:id/implementation-plan', authenticateToken, (req, res) => {
  const { id } = req.params

  const ministry = mockMinistries.find((m) => m.id === id || m.code === id)

  if (!ministry) {
    return res.status(404).json({
      success: false,
      error: 'Ministry not found',
    })
  }

  const plan = {
    ministryId: ministry.id,
    ministryName: ministry.name,
    fiscalYear: '2024/2025',
    strategicObjectives: [
      {
        id: 'obj-1',
        title: `Modernize ${ministry.name.split(' ').pop()} Infrastructure`,
        description: 'Upgrade and expand critical infrastructure to meet growing demands',
        targetDate: '2025-12-31',
        progress: 68,
      },
      {
        id: 'obj-2',
        title: 'Enhance Service Delivery',
        description: 'Improve quality and accessibility of services to citizens',
        targetDate: '2025-09-30',
        progress: 75,
      },
      {
        id: 'obj-3',
        title: 'Strengthen Institutional Capacity',
        description: 'Build capabilities and competencies of ministry staff',
        targetDate: '2025-06-30',
        progress: 82,
      },
    ],
    keyInitiatives: [
      {
        id: 'init-1',
        name: 'Digital Transformation Program',
        status: 'IN_PROGRESS',
        startDate: '2024-07-01',
        endDate: '2025-06-30',
        budget: ministry.budget * 0.3,
        milestones: ['Planning complete', 'Pilot phase', 'Full rollout'],
      },
      {
        id: 'init-2',
        name: 'Capacity Building Initiative',
        status: 'IN_PROGRESS',
        startDate: '2024-09-01',
        endDate: '2025-12-31',
        budget: ministry.budget * 0.15,
        milestones: ['Training needs assessment', 'Curriculum development', 'Training delivery'],
      },
      {
        id: 'init-3',
        name: 'Infrastructure Modernization',
        status: 'ON_TRACK',
        startDate: '2024-04-01',
        endDate: '2025-09-30',
        budget: ministry.budget * 0.4,
        milestones: ['Site assessment', 'Construction', 'Testing', 'Commissioning'],
      },
      {
        id: 'init-4',
        name: 'Public Engagement Program',
        status: 'PLANNING',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        budget: ministry.budget * 0.08,
        milestones: ['Strategy development', 'Platform setup', 'Launch'],
      },
      {
        id: 'init-5',
        name: 'Performance Management System',
        status: 'IN_PROGRESS',
        startDate: '2024-10-01',
        endDate: '2025-03-31',
        budget: ministry.budget * 0.07,
        milestones: ['System design', 'Implementation', 'Go-live'],
      },
    ],
    budgetAllocation: {
      total: ministry.budget,
      allocated: ministry.spent,
      available: ministry.budget - ministry.spent,
      breakdown: [
        { category: 'Capital Projects', amount: ministry.budget * 0.45, percentage: 45 },
        { category: 'Operational Costs', amount: ministry.budget * 0.30, percentage: 30 },
        { category: 'Human Resources', amount: ministry.budget * 0.15, percentage: 15 },
        { category: 'Technology', amount: ministry.budget * 0.10, percentage: 10 },
      ],
    },
    kpis: [
      { name: 'Budget Execution Rate', target: 90, actual: (ministry.spent / ministry.budget) * 100 },
      { name: 'Project Completion Rate', target: 85, actual: 78 },
      { name: 'Service Satisfaction Score', target: 4.0, actual: 4.2 },
      { name: 'Staff Training Hours', target: 40, actual: 35 },
      { name: 'Digital Service Adoption', target: 70, actual: 65 },
    ],
    riskMitigation: [
      { risk: 'Budget constraints', strategy: 'Prioritize high-impact initiatives, explore partnerships' },
      { risk: 'Capacity gaps', strategy: 'Accelerate training programs, engage consultants' },
      { risk: 'Technology challenges', strategy: 'Invest in robust infrastructure, ensure vendor support' },
    ],
  }

  res.json({
    success: true,
    data: plan,
  })
})

// POST /api/ministries/:id/brief/generate - Generate ministry brief
router.post('/:id/brief/generate', authenticateToken, (req, res) => {
  const { id } = req.params

  const ministry = mockMinistries.find((m) => m.id === id || m.code === id)

  if (!ministry) {
    return res.status(404).json({
      success: false,
      error: 'Ministry not found',
    })
  }

  const brief = {
    id: `brief-${Date.now()}`,
    ministryId: ministry.id,
    ministryName: ministry.name,
    generatedAt: new Date().toISOString(),
    period: 'Q4 2024',
    sections: {
      executiveSummary: `${ministry.name} has demonstrated strong performance in Q4 2024 with ${ministry.efficiency}% efficiency rating. Budget execution stands at ${((ministry.spent / ministry.budget) * 100).toFixed(1)}% with ${ministry.projects} active projects. Key achievements include successful completion of 3 major initiatives and improved service delivery metrics.`,
      
      performanceMetrics: {
        budgetUtilization: ((ministry.spent / ministry.budget) * 100).toFixed(1),
        projectsOnTrack: Math.floor(ministry.projects * 0.75),
        projectsAtRisk: Math.ceil(ministry.projects * 0.15),
        efficiencyScore: ministry.efficiency,
        serviceDelivery: 4.2,
      },
      
      activeProjects: [
        {
          name: 'Digital Transformation Program',
          status: 'ON_TRACK',
          progress: 68,
          budget: ministry.budget * 0.3,
          spent: (ministry.budget * 0.3) * 0.68,
        },
        {
          name: 'Infrastructure Modernization',
          status: 'ON_TRACK',
          progress: 72,
          budget: ministry.budget * 0.4,
          spent: (ministry.budget * 0.4) * 0.72,
        },
        {
          name: 'Capacity Building Initiative',
          status: 'IN_PROGRESS',
          progress: 55,
          budget: ministry.budget * 0.15,
          spent: (ministry.budget * 0.15) * 0.55,
        },
      ],
      
      budgetAnalysis: {
        total: ministry.budget,
        spent: ministry.spent,
        available: ministry.budget - ministry.spent,
        utilizationRate: ((ministry.spent / ministry.budget) * 100).toFixed(1),
        projectedYearEnd: ministry.budget * 0.95,
      },
      
      recentAchievements: [
        'Successfully launched 3 digital service platforms with 15,000+ active users',
        'Completed Phase 1 of infrastructure upgrade ahead of schedule',
        'Achieved 92% satisfaction rating in citizen service surveys',
        'Trained 500+ staff members on new systems and processes',
        'Reduced service delivery time by 35% through process optimization',
      ],
      
      challengesAndRisks: [
        {
          challenge: 'Capacity constraints in technical departments',
          impact: 'MEDIUM',
          mitigation: 'Ongoing recruitment and training programs',
        },
        {
          challenge: 'Supply chain delays for critical equipment',
          impact: 'HIGH',
          mitigation: 'Diversified supplier base, increased buffer stocks',
        },
        {
          challenge: 'Budget pressures in Q1 2025',
          impact: 'MEDIUM',
          mitigation: 'Prioritization framework, efficiency improvements',
        },
      ],
      
      upcomingMilestones: [
        { milestone: 'Complete Phase 2 planning', date: '2025-02-15' },
        { milestone: 'Launch new service portal', date: '2025-03-01' },
        { milestone: 'Mid-year performance review', date: '2025-03-31' },
        { milestone: 'Staff training program completion', date: '2025-04-30' },
        { milestone: 'Q1 budget review', date: '2025-05-15' },
      ],
    },
  }

  res.json({
    success: true,
    data: brief,
  })
})

// GET /api/ministries/:id/kpi-snapshot - Export KPI snapshot
router.get('/:id/kpi-snapshot', authenticateToken, (req, res) => {
  const { id } = req.params
  const { format = 'pdf' } = req.query

  const ministry = mockMinistries.find((m) => m.id === id || m.code === id)

  if (!ministry) {
    return res.status(404).json({
      success: false,
      error: 'Ministry not found',
    })
  }

  const snapshot = {
    ministryId: ministry.id,
    ministryName: ministry.name,
    period: 'Q4 2024',
    generatedAt: new Date().toISOString(),
    format,
    kpis: [
      {
        id: 'kpi-1',
        name: 'Budget Execution Rate',
        category: 'Financial',
        target: 90,
        actual: ((ministry.spent / ministry.budget) * 100).toFixed(1),
        unit: '%',
        trend: 'up',
        variance: (((ministry.spent / ministry.budget) * 100 - 90) / 90 * 100).toFixed(1),
      },
      {
        id: 'kpi-2',
        name: 'Project Completion Rate',
        category: 'Operations',
        target: 85,
        actual: 78,
        unit: '%',
        trend: 'stable',
        variance: ((78 - 85) / 85 * 100).toFixed(1),
      },
      {
        id: 'kpi-3',
        name: 'Service Satisfaction Score',
        category: 'Quality',
        target: 4.0,
        actual: 4.2,
        unit: '/5',
        trend: 'up',
        variance: ((4.2 - 4.0) / 4.0 * 100).toFixed(1),
      },
      {
        id: 'kpi-4',
        name: 'Staff Training Hours per Employee',
        category: 'Capacity',
        target: 40,
        actual: 35,
        unit: 'hours',
        trend: 'up',
        variance: ((35 - 40) / 40 * 100).toFixed(1),
      },
      {
        id: 'kpi-5',
        name: 'Digital Service Adoption Rate',
        category: 'Innovation',
        target: 70,
        actual: 65,
        unit: '%',
        trend: 'up',
        variance: ((65 - 70) / 70 * 100).toFixed(1),
      },
    ],
    summary: {
      totalKPIs: 5,
      onTarget: 2,
      aboveTarget: 1,
      belowTarget: 2,
      overallScore: ministry.efficiency,
    },
    downloadUrl: `/downloads/kpi-snapshot-${ministry.code}-${Date.now()}.${format}`,
  }

  res.json({
    success: true,
    data: snapshot,
  })
})

// POST /api/ministries/:id/analyze - Create ministry analysis conversation
router.post('/:id/analyze', authenticateToken, (req, res) => {
  const { id } = req.params

  const ministry = mockMinistries.find((m) => m.id === id || m.code === id)

  if (!ministry) {
    return res.status(404).json({
      success: false,
      error: 'Ministry not found',
    })
  }

  const conversationId = `conv-ministry-${Date.now()}`
  const navigationUrl = `/intelligence?conversation=${conversationId}`

  res.json({
    success: true,
    data: {
      conversationId,
      navigationUrl,
      context: {
        type: 'ministry_analysis',
        ministryId: ministry.id,
        ministryName: ministry.name,
      },
      suggestedTitle: `Analysis: ${ministry.name}`,
    },
  })
})

module.exports = router