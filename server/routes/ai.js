const express = require('express')
const { authenticateToken } = require('./auth')
const { GoogleGenAI } = require('@google/genai')

const router = express.Router()

// Initialize Google GenAI SDK (backend-only). The client reads GEMINI_API_KEY/GOOGLE_AI_API_KEY automatically, but we pass explicitly.
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const { hasNISRData, getDashboardStats } = require('../utils/nisr-loader');

// System instructions define role and constraints
const SYSTEM_INSTRUCTION = [
  'You are an intelligent assistant for the Rwanda Government Intelligence Platform.',
  'You help government officials analyze NISR data, track projects, manage budgets, and identify investment opportunities.',
  'Always cite NISR sources when providing statistics. Be professional, concise, and data-driven.'
].join(' ')

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

router.post('/chat', authenticateToken, async (req, res) => {
  const { message, conversationHistory } = req.body

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message is required' })
  }

  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Gemini chat error: Missing GOOGLE_AI_API_KEY')
      return res.status(503).json({
        success: false,
        message: "I'm having trouble connecting. Please try again.",
        ...(process.env.NODE_ENV !== 'production' ? { reason: 'Missing GOOGLE_AI_API_KEY' } : {}),
      })
    }

    if (!GEMINI_MODEL) {
      console.error('Gemini chat error: Missing GEMINI_MODEL env var')
      return res.status(503).json({
        success: false,
        message: "I'm having trouble connecting. Please try again.",
        ...(process.env.NODE_ENV !== 'production' ? { reason: 'Missing GEMINI_MODEL' } : {}),
      })
    }

    const nisrStats = getDashboardStats()
    const nisrAvailable = hasNISRData() && !!nisrStats

    const buildNisrSource = () => {
      if (!nisrAvailable) return undefined
      const raw = nisrStats.poverty?.source || 'NISR National Statistics'
      const trimmed = raw.replace(/^NISR\s*/i, '').trim() // avoid 'NISR NISR ...'
      let url
      if (/eicv/i.test(raw)) url = 'https://www.statistics.gov.rw/'
      if (/rlfs|labour|labor/i.test(raw)) url = 'https://www.statistics.gov.rw/'
      if (/national accounts|gdp/i.test(raw)) url = 'https://www.statistics.gov.rw/'
      return [{
        id: 'nisr-1',
        name: `${trimmed} (${nisrStats.poverty?.year || nisrStats.gdp?.year || nisrStats.labor?.year || '2024'})`,
        type: 'STATISTICS',
        url,
        lastUpdated: new Date(),
        reliability: 95,
      }]
    }

    // Build a concise NISR context block when data is available
    const nisrContext = nisrAvailable ? [
      'Available NISR Data (use when relevant):',
      `- Poverty Rate: ${nisrStats.poverty?.nationalRate}% (NISR ${nisrStats.poverty?.source} ${nisrStats.poverty?.year})`,
      `- GDP Growth: ${nisrStats.gdp?.totalGrowth}% (NISR ${nisrStats.gdp?.source} ${nisrStats.gdp?.year})`,
      `- Youth Unemployment: ${nisrStats.labor?.youthUnemployment}% (NISR ${nisrStats.labor?.source} ${nisrStats.labor?.year})`
    ].join('\n') : ''

    // Map frontend conversation history to Gemini roles
    const historyContents = Array.isArray(conversationHistory) ? conversationHistory.map((m) => ({
      role: m.role === 'ASSISTANT' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }]
    })) : []

    const contents = [
      // Inject NISR context as a system-like preface via a user turn
      ...(nisrContext ? [{ role: 'user', parts: [{ text: nisrContext }] }] : []),
      ...historyContents,
      { role: 'user', parts: [{ text: message }] },
    ]

    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      systemInstruction: SYSTEM_INSTRUCTION,
    })
    const responseText = result?.text || 'I could not generate a response at this time.'

    // Attempt to extract token usage metrics if available (new SDK returns usage on result)
    const usage = result?.usage || result?.responseMeta?.tokenUsage || undefined

    // Determine if NISR sources should be attached based on query intent
    const lower = message.toLowerCase()
    const nisrRelevant = ['poverty', 'gdp', 'growth', 'unemployment', 'labor', 'rlfs', 'eicv', 'nisr'].some(k => lower.includes(k))

    const sources = (nisrAvailable && nisrRelevant) ? buildNisrSource() : undefined

    return res.json({
      success: true,
      data: {
        id: `msg-${Date.now()}`,
        role: 'ASSISTANT',
        content: responseText,
        timestamp: new Date().toISOString(),
        sources,
        dataSource: (nisrAvailable && nisrRelevant) ? 'NISR' : 'AI',
        usage,
      },
    })
  } catch (error) {
    // Avoid leaking sensitive info; log minimal server-side
    console.error('Gemini chat error:', error?.message || error)
    return res.status(500).json({
      success: false,
      message: "I'm having trouble connecting. Please try again.",
      ...(process.env.NODE_ENV !== 'production' ? { reason: error?.message } : {}),
    })
  }
})

router.get('/suggestions', authenticateToken, (req, res) => {
  const nisrStats = getDashboardStats();

  const suggestions = hasNISRData() ? [
    "What's the current poverty rate in Rwanda?",
    'How is youth unemployment trending?',
    'Show me GDP growth by sector',
    'Which provinces have the highest poverty rates?',
    'What are the top investment opportunities?',
  ] : [
    'Show me projects at risk',
    "What's our budget efficiency?",
    'Top investment opportunities',
  ];

  return res.json({ success: true, data: suggestions })
})

module.exports = router
