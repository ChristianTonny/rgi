/**
 * AI Usage Tracking Middleware
 * 
 * Tracks AI API calls, token usage, and costs for monitoring and analytics
 */

// In-memory storage for usage logs (replace with database in production)
const usageLogs = [];

/**
 * Middleware to track AI usage
 * Add this to AI-related routes to automatically log usage
 */
function trackAIUsage(queryType) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response and log usage
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Extract token usage from response if available
      let tokensUsed = 0;
      if (data && data.metadata && data.metadata.tokensUsed) {
        tokensUsed = data.metadata.tokensUsed;
      } else if (data && data.data && data.data.metadata && data.data.metadata.tokensUsed) {
        tokensUsed = data.data.metadata.tokensUsed;
      } else {
        // Estimate tokens based on query type
        tokensUsed = estimateTokens(queryType, req.body);
      }
      
      // Log the usage
      const log = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: req.user ? req.user.id : 'anonymous',
        queryType,
        tokensUsed,
        responseTimeMs: responseTime,
        endpoint: req.path,
        success: res.statusCode >= 200 && res.statusCode < 300,
        createdAt: new Date().toISOString()
      };
      
      usageLogs.push(log);
      
      // Keep only last 10000 logs in memory
      if (usageLogs.length > 10000) {
        usageLogs.shift();
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Estimate tokens based on query type and content
 */
function estimateTokens(queryType, body) {
  const baseTokens = {
    'chat': 150,
    'search': 50,
    'report': 500,
    'analysis': 300,
    'insight': 200
  };
  
  let tokens = baseTokens[queryType] || 100;
  
  // Add tokens based on content length
  if (body && body.content) {
    tokens += Math.ceil(body.content.length / 4); // Rough estimate: 4 chars per token
  }
  
  if (body && body.query) {
    tokens += Math.ceil(body.query.length / 4);
  }
  
  return tokens;
}

/**
 * Get usage logs for a specific user
 */
function getUserUsageLogs(userId, options = {}) {
  const { startDate, endDate, queryType, limit } = options;
  
  let logs = usageLogs.filter(log => log.userId === userId);
  
  // Filter by date range
  if (startDate) {
    logs = logs.filter(log => new Date(log.createdAt) >= new Date(startDate));
  }
  
  if (endDate) {
    logs = logs.filter(log => new Date(log.createdAt) <= new Date(endDate));
  }
  
  // Filter by query type
  if (queryType) {
    logs = logs.filter(log => log.queryType === queryType);
  }
  
  // Sort by most recent first
  logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Apply limit
  if (limit) {
    logs = logs.slice(0, limit);
  }
  
  return logs;
}

/**
 * Calculate usage statistics for a user
 */
function calculateUserStats(userId, options = {}) {
  const logs = getUserUsageLogs(userId, options);
  
  if (logs.length === 0) {
    return {
      totalQueries: 0,
      totalTokens: 0,
      avgResponseTime: 0,
      estimatedCost: 0,
      successRate: 0,
      breakdown: {}
    };
  }
  
  const totalQueries = logs.length;
  const totalTokens = logs.reduce((sum, log) => sum + log.tokensUsed, 0);
  const avgResponseTime = logs.reduce((sum, log) => sum + log.responseTimeMs, 0) / totalQueries;
  const successfulQueries = logs.filter(log => log.success).length;
  const successRate = (successfulQueries / totalQueries) * 100;
  
  // Calculate cost (example pricing: $0.002 per 1K tokens)
  const costPerToken = 0.002 / 1000;
  const estimatedCost = totalTokens * costPerToken;
  
  // Breakdown by query type
  const breakdown = {};
  logs.forEach(log => {
    if (!breakdown[log.queryType]) {
      breakdown[log.queryType] = {
        count: 0,
        tokens: 0,
        avgResponseTime: 0
      };
    }
    
    breakdown[log.queryType].count++;
    breakdown[log.queryType].tokens += log.tokensUsed;
  });
  
  // Calculate average response time for each type
  Object.keys(breakdown).forEach(type => {
    const typeLogs = logs.filter(log => log.queryType === type);
    breakdown[type].avgResponseTime = 
      typeLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / typeLogs.length;
  });
  
  return {
    totalQueries,
    totalTokens,
    avgResponseTime: Math.round(avgResponseTime),
    estimatedCost: estimatedCost.toFixed(4),
    successRate: successRate.toFixed(2),
    breakdown
  };
}

/**
 * Get usage timeline (aggregated by day)
 */
function getUsageTimeline(userId, days = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const logs = getUserUsageLogs(userId, { startDate });
  
  // Group by date
  const timeline = {};
  
  logs.forEach(log => {
    const date = new Date(log.createdAt).toISOString().split('T')[0];
    
    if (!timeline[date]) {
      timeline[date] = {
        date,
        queries: 0,
        tokens: 0
      };
    }
    
    timeline[date].queries++;
    timeline[date].tokens += log.tokensUsed;
  });
  
  // Convert to array and sort by date
  return Object.values(timeline).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}

module.exports = {
  trackAIUsage,
  getUserUsageLogs,
  calculateUserStats,
  getUsageTimeline
};
