const express = require('express');
const { authenticateToken } = require('./auth');
const { logActivity, ACTIVITY_TYPES } = require('./activity');

const router = express.Router();

// In-memory insights storage (shared with conversations)
const insights = new Map();

/**
 * POST /api/quick-actions/export-report
 * Export dashboard report
 */
router.post('/export-report', authenticateToken, async (req, res) => {
  try {
    const { format = 'pdf', sections = [] } = req.body;
    
    // Simulate report generation
    const reportData = {
      id: `report_${Date.now()}`,
      title: `Dashboard Report - ${new Date().toLocaleDateString()}`,
      format,
      sections,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.name
    };
    
    // Log activity
    logActivity({
      userId: req.user.id,
      activityType: ACTIVITY_TYPES.REPORT_EXPORTED,
      title: 'Report Exported',
      description: `Dashboard report exported as ${format.toUpperCase()}`,
      entityType: 'report',
      entityId: reportData.id,
      metadata: { format, sections }
    });
    
    // In production, this would generate actual PDF/Excel file
    const downloadUrl = `/downloads/reports/${reportData.id}.${format}`;
    
    res.json({
      success: true,
      data: {
        ...reportData,
        downloadUrl
      },
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    });
  }
});

/**
 * POST /api/quick-actions/generate-insights
 * Generate AI insights from dashboard data
 */
router.post('/generate-insights', authenticateToken, async (req, res) => {
  try {
    const { source = 'dashboard', data = {} } = req.body;
    
    // Create a new conversation for the insights
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insightId = `insight_${Date.now()}`;
    
    // Generate insights based on dashboard data
    const insightsData = {
      id: insightId,
      conversationId,
      title: 'Dashboard Intelligence Insights',
      summary: 'AI-generated insights from current dashboard data',
      findings: [
        {
          category: 'Budget Efficiency',
          insight: 'Overall budget efficiency at 88.3% shows strong performance. MINICT leads with 92% efficiency.',
          recommendation: 'Share best practices from MINICT with other ministries to improve efficiency.',
          priority: 'MEDIUM'
        },
        {
          category: 'Project Risks',
          insight: '2 projects currently at risk. Healthcare Modernization showing budget variance.',
          recommendation: 'Immediate review of Healthcare Modernization project timeline and resource allocation.',
          priority: 'HIGH'
        },
        {
          category: 'Investment Opportunities',
          insight: 'Agricultural Processing opportunity shows highest ROI at 22%.',
          recommendation: 'Prioritize Agricultural Processing for investment promotion campaigns.',
          priority: 'MEDIUM'
        },
        {
          category: 'Performance',
          insight: 'MINICT exceeding targets by 4.5% in Digital Adoption.',
          recommendation: 'Document and share MINICT success strategies with other ministries.',
          priority: 'LOW'
        }
      ],
      generatedAt: new Date().toISOString(),
      source,
      dataSources: [
        'NISR EICV7 (Poverty Survey)',
        'NISR RLFS (Labor Force Survey)',
        'NISR National Accounts (GDP Data)',
        'Ministry Budget Reports',
        'Project Performance Metrics'
      ],
      relatedProjects: [
        'National Infrastructure Upgrade',
        'ICT Digital Transformation',
        'Healthcare Modernization'
      ]
    };
    
    // Store the insight in memory
    insights.set(insightId, insightsData);
    
    // Log activity
    logActivity({
      userId: req.user.id,
      activityType: ACTIVITY_TYPES.INSIGHT_GENERATED,
      title: 'AI Insights Generated',
      description: 'Generated 4 strategic insights from dashboard data',
      entityType: 'insight',
      entityId: insightId,
      metadata: { source, findingsCount: insightsData.findings.length }
    });
    
    res.json({
      success: true,
      data: insightsData,
      message: 'Insights generated successfully',
      navigationUrl: `/intelligence?subtab=generated-insights&insight=${insightId}`
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

/**
 * GET /api/quick-actions/trends
 * Get trend data for visualization
 */
router.get('/trends', authenticateToken, (req, res) => {
  try {
    const { period = 12 } = req.query; // months
    
    // Generate trend data for the past N months
    const trends = {
      budget: generateTrendData('Budget Efficiency', period, 80, 95),
      projects: generateTrendData('On-time Delivery', period, 70, 85),
      opportunities: generateTrendData('Investment Volume (Billions)', period, 4, 8),
      performance: generateTrendData('Quality Score', period, 80, 90)
    };
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data'
    });
  }
});

/**
 * POST /api/quick-actions/schedule-briefing
 * Schedule a briefing
 */
router.post('/schedule-briefing', authenticateToken, (req, res) => {
  try {
    const { frequency, delivery, sections, recipients } = req.body;
    
    const briefing = {
      id: `briefing_${Date.now()}`,
      frequency,
      delivery,
      sections,
      recipients,
      createdBy: req.user.name,
      status: 'scheduled',
      nextRun: calculateNextRun(frequency),
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: briefing,
      message: 'Briefing scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling briefing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule briefing'
    });
  }
});

/**
 * GET /api/quick-actions/insights/:insightId
 * Get a specific insight by ID
 */
router.get('/insights/:insightId', authenticateToken, (req, res) => {
  try {
    const { insightId } = req.params;
    
    const insight = insights.get(insightId);
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }
    
    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error fetching insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insight'
    });
  }
});

// Helper functions

function generateTrendData(label, months, min, max) {
  const data = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = Math.random() * (max - min) + min;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
      label
    });
  }
  
  return data;
}

function calculateNextRun(frequency) {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  
  return now.toISOString();
}

module.exports = router;
module.exports.insights = insights;
