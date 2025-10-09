const express = require('express')
const { authenticateToken } = require('./auth')

const router = express.Router()

// Mock projects data
const mockProjects = [
  {
    id: 'proj-1',
    name: 'National Infrastructure Upgrade',
    ministry: 'MININFRA',
    status: 'IN_PROGRESS',
    budget: 8000000000,
    spent: 6800000000,
    risk: 'MEDIUM',
  },
  {
    id: 'proj-2',
    name: 'ICT Digital Transformation',
    ministry: 'MINICT',
    status: 'IN_PROGRESS',
    budget: 5000000000,
    spent: 4200000000,
    risk: 'LOW',
  },
  {
    id: 'proj-3',
    name: 'Healthcare System Modernization',
    ministry: 'MOH',
    status: 'IN_PROGRESS',
    budget: 6000000000,
    spent: 5100000000,
    risk: 'HIGH',
  },
  {
    id: 'proj-4',
    name: 'Education Enhancement Program',
    ministry: 'MINEDUC',
    status: 'ON_TRACK',
    budget: 4000000000,
    spent: 3456000000,
    risk: 'LOW',
  },
]

// Mock recommendations data
const mockRecommendations = [
  {
    id: 'rec-1',
    projectId: 'proj-1',
    projectName: 'National Infrastructure Upgrade',
    title: 'Accelerate Phase 2 Implementation',
    description: 'Fast-track Phase 2 to capitalize on current momentum and available resources',
    rationale: 'Current project is 85% complete on Phase 1 with budget surplus of 15%. Weather conditions are favorable for the next 4 months. Contractor capacity is available.',
    expectedImpact: 'Complete project 3 months early, save 200M RWF in holding costs, enable dependent projects to start sooner',
    priority: 'HIGH',
    status: 'PENDING',
    resourcesRequired: {
      budget: 200000000,
      personnel: 50,
      equipment: ['Heavy machinery', 'Surveying equipment'],
    },
    timeline: {
      start: '2025-02-01',
      end: '2025-07-31',
      milestones: ['Phase 2 planning complete', 'Contractor mobilization', 'Mid-phase review', 'Phase 2 completion'],
    },
    dependencies: ['Weather clearance', 'Contractor availability', 'Budget approval'],
    successMetrics: ['Phase 2 completion by July 2025', 'Budget variance < 5%', 'Quality score > 90%'],
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'rec-2',
    projectId: 'proj-3',
    projectName: 'Healthcare System Modernization',
    title: 'Mitigate Supply Chain Risks',
    description: 'Implement dual-sourcing strategy for critical medical equipment',
    rationale: 'Current single-source supplier has 45-day lead times. Recent global supply chain disruptions pose delivery risks. Project timeline at risk.',
    expectedImpact: 'Reduce delivery delays by 60%, ensure continuous project progress, mitigate 150M RWF cost overrun risk',
    priority: 'HIGH',
    status: 'PENDING',
    resourcesRequired: {
      budget: 50000000,
      personnel: 10,
      equipment: [],
    },
    timeline: {
      start: '2025-01-20',
      end: '2025-03-31',
      milestones: ['Identify alternative suppliers', 'Negotiate contracts', 'Test equipment', 'Full implementation'],
    },
    dependencies: ['Supplier qualification', 'Budget reallocation', 'Technical compatibility'],
    successMetrics: ['Average lead time < 20 days', 'Zero critical delays', 'Cost variance < 3%'],
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'rec-3',
    projectId: 'proj-2',
    projectName: 'ICT Digital Transformation',
    title: 'Expand Citizen Training Program',
    description: 'Increase digital literacy training to boost platform adoption',
    rationale: 'Current platform usage at 42%, below 60% target. User surveys show 65% need training. Low adoption impacts ROI.',
    expectedImpact: 'Increase platform usage to 60%+ within 6 months, improve citizen satisfaction by 25%, achieve project ROI targets',
    priority: 'MEDIUM',
    status: 'PENDING',
    resourcesRequired: {
      budget: 80000000,
      personnel: 25,
      equipment: ['Training materials', 'Computer labs', 'Mobile training units'],
    },
    timeline: {
      start: '2025-02-01',
      end: '2025-08-31',
      milestones: ['Training curriculum development', 'Trainer recruitment', 'Pilot program', 'Full rollout'],
    },
    dependencies: ['Ministry approval', 'Trainer availability', 'Venue access'],
    successMetrics: ['Platform usage > 60%', 'Training completion rate > 80%', 'Satisfaction score > 4.5/5'],
    createdAt: new Date('2025-01-12'),
  },
]

// Storage for implementations
const recommendationImplementations = new Map()

// GET /api/projects - Get all projects
router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: mockProjects,
    total: mockProjects.length,
  })
})

// GET /api/projects/recommendations - List all recommendations
router.get('/recommendations', authenticateToken, (req, res) => {
  const { status, priority, projectId } = req.query

  let filtered = [...mockRecommendations]

  if (status) {
    filtered = filtered.filter((r) => r.status === status)
  }

  if (priority) {
    filtered = filtered.filter((r) => r.priority === priority)
  }

  if (projectId) {
    filtered = filtered.filter((r) => r.projectId === projectId)
  }

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
  })
})

// GET /api/projects/recommendations/:id - Get recommendation details
router.get('/recommendations/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  const recommendation = mockRecommendations.find((r) => r.id === id)

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found',
    })
  }

  res.json({
    success: true,
    data: recommendation,
  })
})

// POST /api/projects/recommendations/:id/apply - Apply recommendation
router.post('/recommendations/:id/apply', authenticateToken, (req, res) => {
  const { id } = req.params
  const { assignedTo, ministryId, notes } = req.body

  const recommendation = mockRecommendations.find((r) => r.id === id)

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found',
    })
  }

  const implementation = {
    id: `impl-${Date.now()}`,
    recommendationId: id,
    assignedTo: assignedTo || 'Project Manager',
    ministryId: ministryId || recommendation.projectId,
    timeline: recommendation.timeline,
    budget: recommendation.resourcesRequired.budget,
    status: 'PLANNED',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  }

  recommendationImplementations.set(implementation.id, implementation)

  // Update recommendation status
  const recIndex = mockRecommendations.findIndex((r) => r.id === id)
  if (recIndex !== -1) {
    mockRecommendations[recIndex].status = 'APPROVED'
  }

  res.json({
    success: true,
    data: {
      implementation,
      message: 'Recommendation approved and implementation plan created',
    },
  })
})

// DELETE /api/projects/recommendations/:id - Dismiss recommendation
router.delete('/recommendations/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  const recIndex = mockRecommendations.findIndex((r) => r.id === id)

  if (recIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found',
    })
  }

  mockRecommendations[recIndex].status = 'DISMISSED'

  res.json({
    success: true,
    message: 'Recommendation dismissed',
  })
})

// POST /api/projects/recommendations/:id/share - Share recommendation
router.post('/recommendations/:id/share', authenticateToken, (req, res) => {
  const { id } = req.params
  const { recipients, message } = req.body

  const recommendation = mockRecommendations.find((r) => r.id === id)

  if (!recommendation) {
    return res.status(404).json({
      success: false,
      error: 'Recommendation not found',
    })
  }

  // In a real implementation, this would send emails/notifications
  res.json({
    success: true,
    data: {
      sharedWith: recipients || ['team@ministry.gov.rw'],
      message: message || 'Strategic recommendation shared',
      timestamp: new Date().toISOString(),
    },
  })
})

// POST /api/projects/:id/analyze - Create project analysis conversation
router.post('/:id/analyze', authenticateToken, (req, res) => {
  const { id } = req.params

  const project = mockProjects.find((p) => p.id === id)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    })
  }

  const conversationId = `conv-project-${Date.now()}`
  const navigationUrl = `/intelligence?conversation=${conversationId}`

  res.json({
    success: true,
    data: {
      conversationId,
      navigationUrl,
      context: {
        type: 'project_analysis',
        projectId: id,
        projectName: project.name,
      },
      suggestedTitle: `Analysis: ${project.name}`,
    },
  })
})

module.exports = router