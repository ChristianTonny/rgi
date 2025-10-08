const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

// In-memory activity log storage
const activityLog = [];

/**
 * Activity types
 */
const ACTIVITY_TYPES = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  OPPORTUNITY_PUBLISHED: 'opportunity_published',
  MINISTRY_PERFORMANCE_UPDATED: 'ministry_performance_updated',
  REPORT_EXPORTED: 'report_exported',
  INSIGHT_GENERATED: 'insight_generated',
  BUDGET_ALLOCATION_CHANGED: 'budget_allocation_changed',
  CONVERSATION_CREATED: 'conversation_created',
  SEARCH_PERFORMED: 'search_performed'
};

/**
 * Log an activity
 */
function logActivity(data) {
  const activity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    activityType: data.activityType,
    title: data.title,
    description: data.description,
    entityType: data.entityType,
    entityId: data.entityId,
    metadata: data.metadata || {},
    createdAt: new Date().toISOString()
  };
  
  activityLog.unshift(activity); // Add to beginning
  
  // Keep only last 1000 activities
  if (activityLog.length > 1000) {
    activityLog.pop();
  }
  
  return activity;
}

/**
 * GET /api/activity/recent
 * Get recent activities
 */
router.get('/recent', authenticateToken, (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    
    let activities = [...activityLog];
    
    // Filter by type if provided
    if (type && type !== 'all') {
      activities = activities.filter(a => a.activityType === type);
    }
    
    // Apply limit
    activities = activities.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: activities,
      total: activityLog.length
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
});

/**
 * POST /api/activity/log
 * Log a new activity
 */
router.post('/log', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, title, description, entityType, entityId, metadata } = req.body;
    
    const activity = logActivity({
      userId,
      activityType,
      title,
      description,
      entityType,
      entityId,
      metadata
    });
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity'
    });
  }
});

// Seed some initial activities for demo
function seedActivities() {
  const demoActivities = [
    {
      userId: '1',
      activityType: ACTIVITY_TYPES.PROJECT_UPDATED,
      title: 'Project Updated',
      description: 'National Infrastructure Upgrade project budget increased by 10%',
      entityType: 'project',
      entityId: 'proj-1',
      metadata: { project: 'National Infrastructure Upgrade', change: 'budget' }
    },
    {
      userId: '1',
      activityType: ACTIVITY_TYPES.OPPORTUNITY_PUBLISHED,
      title: 'New Investment Opportunity',
      description: 'Solar Parks Development opportunity published in Energy sector',
      entityType: 'opportunity',
      entityId: 'opp-1',
      metadata: { opportunity: 'Solar Parks Development', sector: 'Energy' }
    },
    {
      userId: '1',
      activityType: ACTIVITY_TYPES.REPORT_EXPORTED,
      title: 'Report Exported',
      description: 'Q4 2024 Budget Efficiency Report exported as PDF',
      entityType: 'report',
      entityId: 'report-1',
      metadata: { reportType: 'Budget Efficiency', format: 'PDF' }
    },
    {
      userId: '1',
      activityType: ACTIVITY_TYPES.INSIGHT_GENERATED,
      title: 'AI Insight Generated',
      description: 'Generated insights for poverty reduction strategies',
      entityType: 'insight',
      entityId: 'insight-1',
      metadata: { topic: 'Poverty Reduction' }
    },
    {
      userId: '1',
      activityType: ACTIVITY_TYPES.MINISTRY_PERFORMANCE_UPDATED,
      title: 'Ministry Performance Updated',
      description: 'MINICT Digital Adoption KPI updated: 92% achieved',
      entityType: 'ministry',
      entityId: 'ministry-2',
      metadata: { ministry: 'MINICT', kpi: 'Digital Adoption', value: 92 }
    }
  ];
  
  demoActivities.forEach(activity => {
    logActivity(activity);
    // Add delay to get different timestamps
  });
}

// Seed activities on module load
seedActivities();

module.exports = router;
module.exports.logActivity = logActivity;
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
