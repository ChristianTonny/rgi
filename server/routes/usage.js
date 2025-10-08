const express = require('express');
const { authenticateToken } = require('./auth');
const { calculateUserStats, getUsageTimeline, getUserUsageLogs } = require('../middleware/usage-tracker');

const router = express.Router();

/**
 * GET /api/usage/current-month
 * Get current month usage statistics for the authenticated user
 */
router.get('/current-month', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get first day of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = calculateUserStats(userId, {
      startDate: startOfMonth
    });
    
    // Add month info
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    res.json({
      success: true,
      data: {
        ...stats,
        month: monthNames[now.getMonth()],
        year: now.getFullYear(),
        period: {
          start: startOfMonth.toISOString(),
          end: now.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching current month usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics'
    });
  }
});

/**
 * GET /api/usage/breakdown
 * Get detailed breakdown of usage by type
 */
router.get('/breakdown', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const stats = calculateUserStats(userId, {
      startDate,
      endDate
    });
    
    // Calculate percentages for breakdown
    const breakdownWithPercentages = Object.entries(stats.breakdown).map(([type, data]) => ({
      type,
      count: data.count,
      tokens: data.tokens,
      avgResponseTime: Math.round(data.avgResponseTime),
      percentage: ((data.count / stats.totalQueries) * 100).toFixed(2)
    }));
    
    // Sort by count descending
    breakdownWithPercentages.sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      data: {
        total: {
          queries: stats.totalQueries,
          tokens: stats.totalTokens,
          cost: stats.estimatedCost
        },
        breakdown: breakdownWithPercentages
      }
    });
  } catch (error) {
    console.error('Error fetching usage breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage breakdown'
    });
  }
});

/**
 * GET /api/usage/timeline
 * Get usage over time (daily aggregation)
 */
router.get('/timeline', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const timeline = getUsageTimeline(userId, parseInt(days));
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Error fetching usage timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage timeline'
    });
  }
});

/**
 * GET /api/usage/export
 * Export usage logs as CSV
 */
router.get('/export', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, format = 'csv' } = req.query;
    
    const logs = getUserUsageLogs(userId, {
      startDate,
      endDate
    });
    
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Query Type', 'Tokens Used', 'Response Time (ms)', 'Endpoint', 'Success'];
      const rows = logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.queryType,
        log.tokensUsed,
        log.responseTimeMs,
        log.endpoint,
        log.success ? 'Yes' : 'No'
      ]);
      
      const csv = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ai-usage-export.csv');
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: logs
      });
    }
  } catch (error) {
    console.error('Error exporting usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export usage data'
    });
  }
});

/**
 * GET /api/usage/limits
 * Get usage limits and remaining quota
 */
router.get('/limits', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = calculateUserStats(userId, { startDate: startOfMonth });
    
    // Define limits (these could be different per user role)
    const limits = {
      monthlyQueries: 10000,
      monthlyTokens: 1000000,
      dailyQueries: 500
    };
    
    // Calculate remaining
    const remaining = {
      queries: Math.max(0, limits.monthlyQueries - stats.totalQueries),
      tokens: Math.max(0, limits.monthlyTokens - stats.totalTokens)
    };
    
    // Calculate percentages
    const usage = {
      queriesPercentage: ((stats.totalQueries / limits.monthlyQueries) * 100).toFixed(2),
      tokensPercentage: ((stats.totalTokens / limits.monthlyTokens) * 100).toFixed(2)
    };
    
    res.json({
      success: true,
      data: {
        current: {
          queries: stats.totalQueries,
          tokens: stats.totalTokens
        },
        limits,
        remaining,
        usage
      }
    });
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage limits'
    });
  }
});

module.exports = router;
