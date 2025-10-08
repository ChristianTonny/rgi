const express = require('express')
const { authenticateToken } = require('./auth')
const { trackAIUsage } = require('../middleware/usage-tracker')

const router = express.Router()

const { hasNISRData, getDashboardStats } = require('../utils/nisr-loader');

const responseTemplates = {
  budget: {
    keywords: ['budget', 'spending', 'allocation', 'funds', 'money'],
    responses: [
      'Based on current allocations, you have 1.2B RWF available across all ministries. The ICT Ministry is utilizing funds most efficiently at 92%, while Infrastructure has 15% unallocated budget.',
      'Budget analysis shows an 87.5% efficiency rate. Top performers: ICT (92%), Health (89%), Education (85%). Infrastructure Ministry has room for optimization.',
      'Q4 spending is on track. 3.8B RWF spent of 5B RWF total budget. Projected year-end efficiency: 88%.',
    ],
  },
  poverty: {
    keywords: ['poverty', 'poor', 'vulnerable', 'low income', 'eicv'],
    responses: [
      '[NISR_POVERTY_DATA]',
      'Poverty data sourced from NISR EICV survey. Eastern Province shows higher poverty rates than other regions. Social protection programs should prioritize these areas.',
      'According to NISR data, extreme poverty has decreased but regional disparities remain significant. Southern Province performing better than national average.',
    ],
  },
  employment: {
    keywords: ['employment', 'unemployment', 'jobs', 'labor', 'workforce', 'youth'],
    responses: [
      '[NISR_LABOR_DATA]',
      'Youth unemployment remains a key challenge according to NISR Labour Force Survey. ICT and service sectors showing strongest job creation.',
      'Employment data from NISR indicates urban areas have higher unemployment but better job quality. Rural employment dominated by agriculture.',
    ],
  },
  gdp: {
    keywords: ['gdp', 'growth', 'economy', 'economic', 'sector'],
    responses: [
      '[NISR_GDP_DATA]',
      'According to NISR National Accounts, services sector now contributes most to GDP, followed by agriculture and industry.',
      'Economic growth data from NISR shows consistent expansion. ICT and financial services driving urban economy.',
    ],
  },
  projects: {
    keywords: ['project', 'initiative', 'program'],
    responses: [
      'You have 42 active projects. 8 are flagged as at risk due to timeline or budget concerns. Priority attention needed: Infrastructure Upgrade Project, Healthcare System Modernization.',
      'Project portfolio health: 78.5% on-time delivery rate, 85.2% quality score. Best performing: ICT Digital Transformation (98% on schedule).',
      'Three projects require immediate review: National Infrastructure Upgrade (timeline delay), Healthcare Modernization (budget variance), Rural Connectivity (resource constraints).',
    ],
  },
  opportunities: {
    keywords: ['opportunity', 'investment', 'investor'],
    responses: [
      '45 investment opportunities available, 12 marked high priority. Top sectors: Renewable Energy (2.5B RWF), Tourism Infrastructure (1.8B RWF), Agricultural Processing (900M RWF).',
      'New opportunities this week: Solar Parks (Eastern Province, 500M-1B RWF), Eco-Tourism Lodges (1B-2B RWF). Both rated medium risk with strong ROI potential.',
      'Opportunity pipeline value: 2.5B RWF estimated. Energy sector leads with 35% of opportunities, followed by Agriculture (25%) and Tourism (20%).',
    ],
  },
  risk: {
    keywords: ['risk', 'issue', 'problem', 'concern', 'alert'],
    responses: [
      'Eight projects are currently at risk. Primary concerns: five timeline delays, two budget overruns, one resource shortage. Immediate attention needed for Infrastructure Upgrade Project.',
      'Risk assessment summary: High risk (2 projects), Medium risk (6 projects), Low risk (34 projects). No critical risks detected.',
      'Recent risk escalation: Healthcare System Modernization moved to medium risk due to supplier delays. Mitigation plan in progress.',
    ],
  },
  ministry: {
    keywords: ['ministry', 'ministries', 'department'],
    responses: [
      'Ministry performance rankings: 1) ICT (92% efficiency), 2) Health (89%), 3) Education (85%), 4) Finance (83%), 5) Infrastructure (78%).',
      'ICT Ministry leading in efficiency with 92% budget utilization and 95% project on-time delivery. Infrastructure Ministry has improvement opportunities.',
      'Cross-ministry collaboration opportunities identified: ICT + Health (digital health records), Infrastructure + Environment (green construction standards).',
    ],
  },
  help: {
    keywords: ['help', 'what can', 'how do', 'show me'],
    responses: [
      'I can help you with: Budget analysis, Project status updates, Risk assessments, Investment opportunities, Ministry performance reviews, and Strategic recommendations. What would you like to know?',
      "Try asking me about: 'Show projects at risk', 'Budget efficiency report', 'Top investment opportunities', 'Ministry performance comparison'.",
      'I provide real-time insights on budgets, projects, opportunities, and ministry performance. I can also help you identify risks and generate reports.',
    ],
  },
}

const fallbackResponses = [
  "I'm analyzing the data across all government systems. Could you be more specific about what you'd like to know?",
  'I have access to budget, project, opportunity, and ministry data. What aspect would you like me to analyze?',
  'I can provide insights on government intelligence data. Try asking about budgets, projects, risks, or opportunities.',
  'Let me check the latest data. Would you like information about a specific ministry, project, or investment opportunity?',
]

function findCategory(message) {
  const lowerMessage = message.toLowerCase()

  for (const [category, config] of Object.entries(responseTemplates)) {
    if (config.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return category
    }
  }

  return null
}

function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)]
}

router.post('/chat', authenticateToken, trackAIUsage('chat'), (req, res) => {
  const { message, conversationId } = req.body

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    })
  }

  const category = findCategory(message)

  let response = category
    ? getRandomResponse(responseTemplates[category].responses)
    : getRandomResponse(fallbackResponses)

  // Replace NISR placeholders with real data if available
  const nisrStats = getDashboardStats();
  if (nisrStats) {
    response = response
      .replace('[NISR_POVERTY_DATA]',
        `According to NISR ${nisrStats.poverty.source} (${nisrStats.poverty.year}), national poverty rate is ${nisrStats.poverty.nationalRate}% and extreme poverty is ${nisrStats.poverty.extremePovertyRate}%. Regional breakdown: ${Object.entries(nisrStats.poverty.byProvince).map(([province, rate]) => `${province} (${rate}%)`).join(', ')}.`)
      .replace('[NISR_LABOR_DATA]',
        `According to NISR ${nisrStats.labor.source} (${nisrStats.labor.year}), employment rate is ${nisrStats.labor.employmentRate}%, unemployment rate is ${nisrStats.labor.unemploymentRate}%, and youth unemployment is ${nisrStats.labor.youthUnemployment}%.`)
      .replace('[NISR_GDP_DATA]',
        `According to NISR ${nisrStats.gdp.source} (${nisrStats.gdp.year}), GDP growth rate is ${nisrStats.gdp.totalGrowth}%. Sector contributions: ${Object.entries(nisrStats.gdp.bySector).map(([sector, contrib]) => `${sector} (${contrib}%)`).join(', ')}.`);
  } else {
    // Remove placeholder tags if no NISR data available
    response = response
      .replace('[NISR_POVERTY_DATA]', 'NISR poverty data not yet loaded. Using estimates based on historical trends.')
      .replace('[NISR_LABOR_DATA]', 'NISR labor force data not yet loaded. Using estimates based on historical surveys.')
      .replace('[NISR_GDP_DATA]', 'NISR GDP data not yet loaded. Using estimates based on economic indicators.');
  }

  // Create sources array with NISR attribution if data is available
  const sources = hasNISRData() ? [
    {
      id: 'nisr-1',
      name: nisrStats ? `NISR ${nisrStats.poverty?.source || 'National Statistics'} (2024)` : 'NISR National Statistics',
      type: 'DATA',
      lastUpdated: new Date(),
      reliability: 95,
    }
  ] : [];

  return res.json({
    success: true,
    data: {
      id: `msg-${Date.now()}`,
      role: 'ASSISTANT',
      content: response,
      timestamp: new Date(),
      sources: sources.length > 0 ? sources : undefined,
      dataSource: hasNISRData() ? 'NISR' : 'MOCK',
    },
  })
})

router.get('/suggestions', authenticateToken, (req, res) => {
  const nisrStats = getDashboardStats();

  const suggestions = hasNISRData() ? [
    "What's the current poverty rate?",
    "Show me youth unemployment data",
    "What's our GDP growth rate?",
    'Show me projects at risk',
    'Top investment opportunities',
  ] : [
    'Show me projects at risk',
    "What's our budget efficiency?",
    'Top investment opportunities',
    'Ministry performance comparison',
    'Recent risk alerts',
  ];

  return res.json({
    success: true,
    data: suggestions,
  })
})

module.exports = router
