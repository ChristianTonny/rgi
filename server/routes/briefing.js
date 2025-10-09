const express = require('express')
const { authenticateToken } = require('./auth')

const router = express.Router()

// Storage for generated briefings
const briefingsStorage = new Map()

// POST /api/ministries/:id/generate-briefing - Generate comprehensive ministry briefing
router.post('/:id/generate-briefing', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { sections, format = 'pdf', recipients } = req.body

  try {
    // Step 1: Collect briefing data from multiple sources
    const briefingData = await collectBriefingData(id)

    if (!briefingData) {
      return res.status(404).json({
        success: false,
        error: 'Ministry not found',
      })
    }

    // Step 2: Generate AI-powered analysis
    const aiAnalysis = await generateBriefingWithAI(briefingData, sections)

    // Step 3: Create structured briefing document
    const briefing = {
      id: `briefing-${Date.now()}`,
      ministryId: briefingData.ministryInfo.id,
      ministryName: briefingData.ministryInfo.name,
      generatedBy: req.user?.id || 'system',
      title: `${briefingData.ministryInfo.name} - Executive Briefing`,
      format,
      sections: aiAnalysis,
      generatedAt: new Date().toISOString(),
      metadata: {
        dataCollected: new Date().toISOString(),
        sourcesUsed: [
          'Ministry Database',
          'NISR Economic Indicators',
          'Project Management System',
          'Performance Metrics',
          'Budget System',
        ],
        aiModel: 'Gemini 1.5 Pro',
      },
    }

    // Step 4: Save briefing
    briefingsStorage.set(briefing.id, briefing)

    // Step 5: Generate download URL
    const downloadUrl = `/api/briefings/${briefing.id}/download?format=${format}`

    // Step 6: Optional - Send email to recipients
    if (recipients && recipients.length > 0) {
      await emailBriefing(briefing, recipients)
    }

    res.json({
      success: true,
      data: {
        briefingId: briefing.id,
        downloadUrl,
        briefing: {
          id: briefing.id,
          title: briefing.title,
          ministryName: briefing.ministryName,
          generatedAt: briefing.generatedAt,
          sections: Object.keys(briefing.sections),
        },
      },
    })
  } catch (error) {
    console.error('Briefing generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate briefing',
      message: error.message,
    })
  }
})

// GET /api/briefings/:id/download - Download generated briefing
router.get('/:id/download', authenticateToken, (req, res) => {
  const { id } = req.params
  const { format = 'pdf' } = req.query

  const briefing = briefingsStorage.get(id)

  if (!briefing) {
    return res.status(404).json({
      success: false,
      error: 'Briefing not found',
    })
  }

  // In a real implementation, this would generate and stream the actual PDF/Word file
  res.json({
    success: true,
    data: {
      briefingId: briefing.id,
      title: briefing.title,
      format,
      downloadUrl: `/downloads/briefing-${id}.${format}`,
      contentType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileName: `briefing-${briefing.ministryName.replace(/\s+/g, '-')}-${Date.now()}.${format}`,
    },
  })
})

// Helper function: Collect data from multiple sources
async function collectBriefingData(ministryId) {
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

  const ministry = mockMinistries.find((m) => m.id === ministryId || m.code === ministryId)

  if (!ministry) {
    return null
  }

  // Collect comprehensive data
  return {
    ministryInfo: ministry,
    
    performanceMetrics: {
      budgetExecutionRate: ((ministry.spent / ministry.budget) * 100).toFixed(1),
      projectsOnTrack: Math.floor(ministry.projects * 0.75),
      projectsAtRisk: Math.ceil(ministry.projects * 0.15),
      efficiencyScore: ministry.efficiency,
      serviceDeliveryScore: 4.2,
    },
    
    projects: [
      {
        name: 'Digital Transformation Program',
        status: 'ON_TRACK',
        progress: 68,
        budget: ministry.budget * 0.3,
        spent: (ministry.budget * 0.3) * 0.68,
        startDate: '2024-07-01',
        endDate: '2025-06-30',
      },
      {
        name: 'Infrastructure Modernization',
        status: 'ON_TRACK',
        progress: 72,
        budget: ministry.budget * 0.4,
        spent: (ministry.budget * 0.4) * 0.72,
        startDate: '2024-04-01',
        endDate: '2025-09-30',
      },
      {
        name: 'Capacity Building Initiative',
        status: 'IN_PROGRESS',
        progress: 55,
        budget: ministry.budget * 0.15,
        spent: (ministry.budget * 0.15) * 0.55,
        startDate: '2024-09-01',
        endDate: '2025-12-31',
      },
    ],
    
    budgetData: {
      total: ministry.budget,
      spent: ministry.spent,
      available: ministry.budget - ministry.spent,
      utilizationRate: ((ministry.spent / ministry.budget) * 100).toFixed(1),
      breakdown: [
        { category: 'Capital Projects', amount: ministry.budget * 0.45 },
        { category: 'Operational Costs', amount: ministry.budget * 0.30 },
        { category: 'Human Resources', amount: ministry.budget * 0.15 },
        { category: 'Technology', amount: ministry.budget * 0.10 },
      ],
    },
    
    nisrData: {
      economicIndicators: {
        gdpContribution: '5.2%',
        employmentGenerated: 15000,
        sectorGrowthRate: '8.5%',
      },
      demographicImpact: {
        beneficiaries: 250000,
        regionalCoverage: '85%',
      },
    },
    
    recentActivities: [
      {
        type: 'PROJECT_COMPLETED',
        description: 'Completed Phase 1 of infrastructure upgrade',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: 'MILESTONE_ACHIEVED',
        description: 'Reached 15,000 active users on digital platform',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: 'BUDGET_APPROVED',
        description: 'Q1 2025 supplementary budget approved',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    
    opportunities: [
      {
        title: 'Public-Private Partnership for Digital Services',
        estimatedValue: 500000000,
        feasibility: 'HIGH',
      },
      {
        title: 'International Development Grant Application',
        estimatedValue: 800000000,
        feasibility: 'MEDIUM',
      },
    ],
  }
}

// Helper function: Generate AI-powered analysis
async function generateBriefingWithAI(data, requestedSections = []) {
  // In a real implementation, this would call the Gemini API
  // For now, generate comprehensive structured content
  
  const allSections = {
    executiveSummary: {
      title: 'Executive Summary',
      content: `
${data.ministryInfo.name} has demonstrated strong performance during the current fiscal year, achieving an efficiency rating of ${data.ministryInfo.efficiency}%. 

**Key Highlights:**
- Budget execution at ${data.performanceMetrics.budgetExecutionRate}% with strong fiscal discipline
- ${data.performanceMetrics.projectsOnTrack} out of ${data.ministryInfo.projects} projects on track
- Service delivery score of ${data.performanceMetrics.serviceDeliveryScore}/5.0 exceeding targets
- ${data.nisrData.demographicImpact.beneficiaries.toLocaleString()} citizens directly benefiting from ministry programs

The ministry is well-positioned to achieve its strategic objectives for the fiscal year, with particular strength in digital transformation and infrastructure modernization initiatives.
      `.trim(),
    },
    
    keyPerformanceHighlights: {
      title: 'Key Performance Highlights',
      content: `
**Financial Performance:**
- Total Budget: ${(data.budgetData.total / 1000000000).toFixed(1)}B RWF
- Utilized: ${(data.budgetData.spent / 1000000000).toFixed(1)}B RWF (${data.budgetData.utilizationRate}%)
- Available: ${(data.budgetData.available / 1000000000).toFixed(1)}B RWF

**Project Portfolio:**
- Active Projects: ${data.ministryInfo.projects}
- On Track: ${data.performanceMetrics.projectsOnTrack} (${Math.floor((data.performanceMetrics.projectsOnTrack / data.ministryInfo.projects) * 100)}%)
- At Risk: ${data.performanceMetrics.projectsAtRisk} requiring attention

**Operational Efficiency:**
- Overall Efficiency Score: ${data.ministryInfo.efficiency}%
- Service Delivery Rating: ${data.performanceMetrics.serviceDeliveryScore}/5.0
- Regional Coverage: ${data.nisrData.demographicImpact.regionalCoverage}

**Economic Impact:**
- GDP Contribution: ${data.nisrData.economicIndicators.gdpContribution}
- Employment Generated: ${data.nisrData.economicIndicators.employmentGenerated.toLocaleString()} jobs
- Sector Growth Rate: ${data.nisrData.economicIndicators.sectorGrowthRate}
      `.trim(),
    },
    
    criticalIssues: {
      title: 'Critical Issues Requiring Attention',
      content: `
**1. Resource Optimization**
With ${data.performanceMetrics.projectsAtRisk} projects at risk, immediate intervention is required to prevent delays and cost overruns. Recommended actions include resource reallocation and enhanced project management oversight.

**2. Capacity Constraints**
Current staffing levels may not support the ambitious digital transformation agenda. Consider accelerated recruitment and training programs for technical positions.

**3. Budget Pressures Q1 2025**
With ${data.budgetData.utilizationRate}% budget execution, careful planning is needed for Q1 2025 to avoid funding gaps. Priority should be given to high-impact initiatives.

**4. Stakeholder Engagement**
Enhanced communication with citizens and partners is needed to maximize the impact of ongoing initiatives and ensure alignment with national priorities.
      `.trim(),
    },
    
    budgetAnalysis: {
      title: 'Budget Analysis',
      content: `
**Overview:**
${data.ministryInfo.name} manages a total budget of ${(data.budgetData.total / 1000000000).toFixed(1)}B RWF for the current fiscal year.

**Budget Breakdown:**
${data.budgetData.breakdown.map((item) => 
  `- ${item.category}: ${(item.amount / 1000000000).toFixed(2)}B RWF (${((item.amount / data.budgetData.total) * 100).toFixed(1)}%)`
).join('\n')}

**Execution Status:**
- Total Allocated: ${(data.budgetData.total / 1000000000).toFixed(1)}B RWF
- Spent to Date: ${(data.budgetData.spent / 1000000000).toFixed(1)}B RWF (${data.budgetData.utilizationRate}%)
- Remaining: ${(data.budgetData.available / 1000000000).toFixed(1)}B RWF

**Utilization Rate Analysis:**
The ${data.budgetData.utilizationRate}% utilization rate indicates ${
  parseFloat(data.budgetData.utilizationRate) > 85 ? 'strong' : 'moderate'
} budget execution. This positions the ministry well for year-end targets.

**Forecast:**
Based on current trends, projected year-end expenditure is approximately ${(data.budgetData.total * 0.95 / 1000000000).toFixed(1)}B RWF, suggesting effective budget management.
      `.trim(),
    },
    
    projectPortfolioStatus: {
      title: 'Project Portfolio Status',
      content: `
**Active Projects Overview:**

${data.projects.map((project, index) => `
**${index + 1}. ${project.name}**
- Status: ${project.status}
- Progress: ${project.progress}%
- Budget: ${(project.budget / 1000000000).toFixed(2)}B RWF
- Spent: ${(project.spent / 1000000000).toFixed(2)}B RWF (${((project.spent / project.budget) * 100).toFixed(1)}%)
- Timeline: ${project.startDate} to ${project.endDate}
- Health: ${project.progress > 70 ? '🟢 Healthy' : project.progress > 50 ? '🟡 Needs Attention' : '🔴 At Risk'}
`).join('\n')}

**Portfolio Health Summary:**
- Total Projects: ${data.ministryInfo.projects}
- Combined Budget: ${(data.projects.reduce((sum, p) => sum + p.budget, 0) / 1000000000).toFixed(1)}B RWF
- Average Progress: ${Math.floor(data.projects.reduce((sum, p) => sum + p.progress, 0) / data.projects.length)}%
- On-Time Delivery: ${Math.floor((data.performanceMetrics.projectsOnTrack / data.ministryInfo.projects) * 100)}%
      `.trim(),
    },
    
    strategicRecommendations: {
      title: 'Strategic Recommendations',
      content: `
**1. Accelerate Digital Transformation (HIGH PRIORITY)**
Continue investing in digital infrastructure and citizen-facing platforms. Current adoption rates show strong potential for significant impact on service delivery and efficiency.

**2. Strengthen Project Risk Management (HIGH PRIORITY)**
Implement enhanced monitoring for the ${data.performanceMetrics.projectsAtRisk} at-risk projects. Consider establishing a dedicated risk management task force.

**3. Explore Partnership Opportunities (MEDIUM PRIORITY)**
Pursue the identified PPP opportunities worth ${(data.opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0) / 1000000000).toFixed(1)}B RWF to amplify impact and leverage private sector expertise.

**4. Capacity Development (MEDIUM PRIORITY)**
Invest in staff training and development programs to build internal capabilities for managing complex transformation initiatives.

**5. Stakeholder Communication (MEDIUM PRIORITY)**
Enhance transparency and engagement with citizens, partners, and other government agencies to maximize program effectiveness and public trust.

**6. Performance Measurement (LOW PRIORITY - OPERATIONAL)**
Continue refining KPIs and measurement frameworks to ensure data-driven decision making and continuous improvement.
      `.trim(),
    },
    
    upcomingMilestones: {
      title: 'Upcoming Milestones',
      content: `
**Q1 2025 (January - March):**
- Complete Phase 2 planning for Infrastructure Modernization
- Launch new digital service portal
- Conduct mid-year performance review
- Submit Q2 budget proposals

**Q2 2025 (April - June):**
- Complete staff training program
- Achieve 70% budget execution
- Launch public engagement initiative
- Finalize PPP framework agreements

**Q3 2025 (July - September):**
- Complete Infrastructure Modernization project
- Evaluate Digital Transformation outcomes
- Conduct stakeholder satisfaction survey
- Prepare annual report

**Q4 2025 (October - December):**
- Year-end performance assessment
- Strategic planning for FY 2025/2026
- Budget proposal for next fiscal year
- Awards and recognition ceremonies
      `.trim(),
    },
    
    appendix: {
      title: 'Appendix',
      content: `
**Data Sources:**
- Ministry Management Information System
- National Institute of Statistics of Rwanda (NISR)
- Project Management System
- Financial Management System
- Performance Monitoring Framework

**Methodology:**
This briefing was generated using AI-powered analysis combining:
- Real-time ministry performance data
- NISR economic and demographic indicators
- Historical project performance trends
- Budget execution reports
- Stakeholder feedback

**Contact Information:**
For questions or additional information about this briefing:
- Email: info@${data.ministryInfo.code.toLowerCase()}.gov.rw
- Website: www.${data.ministryInfo.code.toLowerCase()}.gov.rw
- Phone: +250 XXX XXX XXX

**Generated:** ${new Date().toLocaleString('en-RW', { 
  dateStyle: 'full', 
  timeStyle: 'short',
  timeZone: 'Africa/Kigali' 
})}
**AI Model:** Gemini 1.5 Pro
**Version:** 1.0
      `.trim(),
    },
  }

  // Return requested sections or all sections
  if (requestedSections && requestedSections.length > 0) {
    const selectedSections = {}
    requestedSections.forEach((section) => {
      if (allSections[section]) {
        selectedSections[section] = allSections[section]
      }
    })
    return selectedSections
  }

  return allSections
}

// Helper function: Email briefing (mock implementation)
async function emailBriefing(briefing, recipients) {
  // In a real implementation, this would send actual emails
  console.log(`Briefing ${briefing.id} would be emailed to:`, recipients)
  return {
    success: true,
    sentTo: recipients,
    sentAt: new Date().toISOString(),
  }
}

module.exports = router
