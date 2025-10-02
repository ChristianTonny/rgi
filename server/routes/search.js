const express = require('express')
const { authenticateToken } = require('./auth')

const router = express.Router()

const mockSearchData = [
  {
    id: 'proj-1',
    type: 'PROJECT',
    title: 'National Infrastructure Upgrade',
    content: 'Modernizing road and bridge infrastructure across all provinces',
    source: { name: 'Ministry of Infrastructure' },
    metadata: { budget: 1_500_000_000, status: 'IN_PROGRESS' },
  },
  {
    id: 'proj-2',
    type: 'PROJECT',
    title: 'ICT Digital Transformation Initiative',
    content: 'Implementing e-governance platforms and digital services for citizens',
    source: { name: 'Ministry of ICT' },
    metadata: { budget: 800_000_000, status: 'IN_PROGRESS' },
  },
  {
    id: 'proj-3',
    type: 'PROJECT',
    title: 'Healthcare System Modernization',
    content: 'Upgrading healthcare facilities and implementing electronic health records',
    source: { name: 'Ministry of Health' },
    metadata: { budget: 1_200_000_000, status: 'PLANNING' },
  },
  {
    id: 'opp-1',
    type: 'OPPORTUNITY',
    title: 'Renewable Energy Investment - Solar Parks',
    content: 'Investment opportunity in 50MW solar park development in Eastern Province',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '500M-1B RWF', sector: 'Energy', riskLevel: 'MEDIUM' },
  },
  {
    id: 'opp-2',
    type: 'OPPORTUNITY',
    title: 'Agricultural Processing Plant',
    content: 'Coffee and tea processing facility expansion opportunity',
    source: { name: 'Ministry of Agriculture' },
    metadata: { investmentRange: '200M-500M RWF', sector: 'Agriculture', riskLevel: 'LOW' },
  },
  {
    id: 'opp-3',
    type: 'OPPORTUNITY',
    title: 'Tourism Infrastructure Development',
    content: 'Eco-tourism lodges and visitor centers in national parks',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '1B-2B RWF', sector: 'Tourism', riskLevel: 'MEDIUM' },
  },
  {
    id: 'insight-1',
    type: 'INSIGHT',
    title: 'Budget Efficiency Analysis Q4 2024',
    content: 'Analysis shows 12% improvement in budget utilization across ministries',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'BUDGET', confidence: 0.92 },
  },
  {
    id: 'insight-2',
    type: 'INSIGHT',
    title: 'Project Risk Assessment - Infrastructure',
    content: 'Three infrastructure projects require immediate attention due to timeline delays',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'RISK', confidence: 0.88 },
  },
  {
    id: 'policy-1',
    type: 'POLICY',
    title: 'Digital Economy Policy Framework 2024',
    content: 'New framework for digital economy growth and innovation support',
    source: { name: 'Ministry of ICT' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-01-01' },
  },
  {
    id: 'policy-2',
    type: 'POLICY',
      title: 'Green Growth Strategy',
    content: 'National strategy for sustainable development and environmental protection',
    source: { name: 'Ministry of Environment' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-03-01' },
  },
]

router.get('/', authenticateToken, (req, res) => {
  const { q, limit = 10 } = req.query

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: [],
      message: 'Query too short',
    })
  }

  const query = q.toLowerCase().trim()

  const results = mockSearchData.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(query)
    const contentMatch = item.content.toLowerCase().includes(query)
    return titleMatch || contentMatch
  })

  const limitedResults = results.slice(0, parseInt(limit, 10))

  return res.json({
    success: true,
    data: limitedResults,
    total: results.length,
    query: q,
  })
})

module.exports = router
