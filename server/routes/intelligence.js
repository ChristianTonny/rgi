const express = require('express');
const { authenticateToken } = require('./auth');
const { hasNISRData, getDashboardStats } = require('../utils/nisr-loader');
const router = express.Router();

const getDashboardModules = () => {
  // Check if NISR data is available
  const nisrStats = getDashboardStats();

  if (nisrStats) {
    // Use real NISR data
    return [
      {
        id: 'resource-allocation-1',
        type: 'resource-allocation',
        title: 'Resource Allocation Intelligence',
        priority: 'HIGH',
        lastUpdated: new Date().toISOString(),
        data: {
          totalBudget: 5_000_000_000,
          available: 1_200_000_000,
          spent: 3_800_000_000,
          efficiency: 87.5,
          nisrData: {
            povertyRate: nisrStats.poverty.nationalRate,
            source: nisrStats.poverty.source,
            year: nisrStats.poverty.year,
          },
          recommendedActions: [
            `Poverty rate at ${nisrStats.poverty.nationalRate}% (NISR ${nisrStats.poverty.year}) - consider social protection budget increase`,
            'Review infrastructure projects exceeding 20% variance'
          ],
        },
        insights: [],
      },
      {
        id: 'opportunity-radar-1',
        type: 'opportunity-radar',
        title: 'Opportunity Radar',
        priority: 'HIGH',
        lastUpdated: new Date().toISOString(),
        data: {
          totalOpportunities: 45,
          highPriorityOpportunities: 12,
          estimatedValue: 2_500_000_000,
          nisrData: {
            gdpGrowth: nisrStats.gdp.totalGrowth,
            topSectors: nisrStats.gdp.bySector,
            source: nisrStats.gdp.source,
            year: nisrStats.gdp.year,
          },
          sectors: [
            { name: 'Energy', count: 14 },
            { name: 'Agriculture', count: 11 },
            { name: 'Tourism', count: 8 },
            { name: 'Digital Services', count: 12 },
          ],
        },
        insights: [],
      },
      {
        id: 'performance-monitor-1',
        type: 'performance-monitor',
        title: 'Performance Monitor',
        priority: 'MEDIUM',
        lastUpdated: new Date().toISOString(),
        data: {
          projectsAtRisk: 8,
          totalProjects: 42,
          onTimeDelivery: 78.5,
          qualityScore: 85.2,
          nisrData: {
            unemploymentRate: nisrStats.labor.unemploymentRate,
            youthUnemployment: nisrStats.labor.youthUnemployment,
            source: nisrStats.labor.source,
            year: nisrStats.labor.year,
          },
          topRisks: [
            `Youth unemployment at ${nisrStats.labor.youthUnemployment}% (NISR ${nisrStats.labor.year}) - employment programs needed`,
            'Healthcare System Modernization (supplier delays)',
          ],
        },
        insights: [],
      },
    ];
  }

  // Fallback to mock data if NISR data not available
  return [
  {
    id: 'resource-allocation-1',
    type: 'resource-allocation',
    title: 'Resource Allocation Intelligence',
    priority: 'HIGH',
    lastUpdated: new Date().toISOString(),
    data: {
      totalBudget: 5_000_000_000,
      available: 1_200_000_000,
      spent: 3_800_000_000,
      efficiency: 87.5,
      recommendedActions: [
        'Increase ICT budget allocation by 10% to meet project demand',
        'Review infrastructure projects exceeding 20% variance'
      ],
    },
    insights: [],
  },
  {
    id: 'opportunity-radar-1',
    type: 'opportunity-radar',
    title: 'Opportunity Radar',
    priority: 'HIGH',
    lastUpdated: new Date().toISOString(),
    data: {
      totalOpportunities: 45,
      highPriorityOpportunities: 12,
      estimatedValue: 2_500_000_000,
      sectors: [
        { name: 'Energy', count: 14 },
        { name: 'Agriculture', count: 11 },
        { name: 'Tourism', count: 8 },
        { name: 'Digital Services', count: 12 },
      ],
    },
    insights: [],
  },
  {
    id: 'performance-monitor-1',
    type: 'performance-monitor',
    title: 'Performance Monitor',
    priority: 'MEDIUM',
    lastUpdated: new Date().toISOString(),
    data: {
      projectsAtRisk: 8,
      totalProjects: 42,
      onTimeDelivery: 78.5,
      qualityScore: 85.2,
      topRisks: [
        'Rural Electrification Phase 3 (timeline variance)',
        'Healthcare System Modernization (supplier delays)',
      ],
    },
    insights: [],
  },
  ];
};

router.get('/modules', authenticateToken, (req, res) => {
  const modules = getDashboardModules();
  const usingNISRData = hasNISRData();

  return res.json({
    success: true,
    data: modules,
    timestamp: new Date().toISOString(),
    dataSource: usingNISRData ? 'NISR' : 'MOCK',
    message: usingNISRData ? undefined : 'Using mock data. Add CSV files to /data/nisr-datasets/ for real NISR data.',
  });
});

// Get specific intelligence module
router.get('/modules/:type', authenticateToken, (req, res) => {
  try {
    const moduleType = req.params.type;
    const module = intelligenceData[moduleType];
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Intelligence module not found'
      });
    }
    
    res.json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Intelligence module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch intelligence module'
    });
  }
});

// Get insights across all modules
router.get('/insights', authenticateToken, (req, res) => {
  try {
    const allInsights = [];
    
    Object.values(intelligenceData).forEach(module => {
      module.insights.forEach(insight => {
        allInsights.push({
          ...insight,
          moduleType: module.type,
          moduleTitle: module.title
        });
      });
    });
    
    // Sort by priority and date
    allInsights.sort((a, b) => {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityWeight[b.impact] - priorityWeight[a.impact];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.json({
      success: true,
      data: allInsights,
      total: allInsights.length,
      actionRequired: allInsights.filter(i => i.actionRequired).length
    });

  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insights'
    });
  }
});

// Update insight status (mark as read, action taken, etc.)
router.patch('/insights/:id/status', authenticateToken, (req, res) => {
  try {
    const insightId = req.params.id;
    const { status, actionTaken } = req.body;
    
    // Find and update insight (in production, update database)
    let found = false;
    Object.values(intelligenceData).forEach(module => {
      const insight = module.insights.find(i => i.id === insightId);
      if (insight) {
        insight.status = status;
        if (actionTaken) {
          insight.actionTaken = actionTaken;
          insight.actionTakenAt = new Date();
          insight.actionTakenBy = req.user.userId;
        }
        found = true;
      }
    });
    
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Insight status updated successfully'
    });

  } catch (error) {
    console.error('Update insight error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update insight status'
    });
  }
});

module.exports = router;