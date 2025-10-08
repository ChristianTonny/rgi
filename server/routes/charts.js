const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

/**
 * GET /api/charts/budget-execution
 * Get budget execution data over time (line chart)
 */
router.get('/budget-execution', authenticateToken, (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    // Generate monthly budget execution data
    const data = [];
    const now = new Date();
    
    const ministries = ['MININFRA', 'MINICT', 'MOH', 'MINEDUC'];
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: date.toISOString().split('T')[0]
      };
      
      ministries.forEach(ministry => {
        // Simulate budget spent vs allocated with realistic progression
        const baseSpent = 70 + (i * 2); // Gradually increasing
        const variance = (Math.random() * 10) - 5; // +/- 5%
        monthData[`${ministry}_spent`] = Math.min(95, baseSpent + variance);
        monthData[`${ministry}_allocated`] = 100;
      });
      
      data.push(monthData);
    }
    
    res.json({
      success: true,
      data,
      chartType: 'line',
      title: 'Budget Execution Over Time',
      xAxis: 'month',
      yAxis: 'percentage'
    });
  } catch (error) {
    console.error('Error fetching budget execution data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budget execution data'
    });
  }
});

/**
 * GET /api/charts/project-status
 * Get project status distribution (donut chart)
 */
router.get('/project-status', authenticateToken, (req, res) => {
  try {
    const data = [
      { status: 'On Track', count: 28, percentage: 66.7, color: '#10b981' },
      { status: 'At Risk', count: 8, percentage: 19.0, color: '#f59e0b' },
      { status: 'Delayed', count: 4, percentage: 9.5, color: '#ef4444' },
      { status: 'Completed', count: 2, percentage: 4.8, color: '#3b82f6' }
    ];
    
    res.json({
      success: true,
      data,
      chartType: 'donut',
      title: 'Project Status Distribution',
      total: 42
    });
  } catch (error) {
    console.error('Error fetching project status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project status data'
    });
  }
});

/**
 * GET /api/charts/investment-opportunities
 * Get investment opportunities by sector (bar chart)
 */
router.get('/investment-opportunities', authenticateToken, (req, res) => {
  try {
    const data = [
      { sector: 'Energy', count: 8, investment: 2500000000, avgROI: 18, riskLevel: 'MEDIUM' },
      { sector: 'Agriculture', count: 12, investment: 1800000000, avgROI: 22, riskLevel: 'LOW' },
      { sector: 'Tourism', count: 6, investment: 3200000000, avgROI: 15, riskLevel: 'MEDIUM' },
      { sector: 'Manufacturing', count: 10, investment: 4500000000, avgROI: 20, riskLevel: 'HIGH' },
      { sector: 'ICT', count: 9, investment: 2100000000, avgROI: 25, riskLevel: 'LOW' }
    ];
    
    res.json({
      success: true,
      data,
      chartType: 'bar',
      title: 'Investment Opportunities by Sector',
      xAxis: 'sector',
      yAxis: 'investment'
    });
  } catch (error) {
    console.error('Error fetching investment opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investment opportunities data'
    });
  }
});

/**
 * GET /api/charts/performance-trends
 * Get performance trends over time (area chart)
 */
router.get('/performance-trends', authenticateToken, (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Generate monthly performance data for ministries
    const data = [];
    const now = new Date();
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        date: date.toISOString().split('T')[0],
        MININFRA: 82 + (Math.random() * 8),
        MINICT: 90 + (Math.random() * 5),
        MOH: 85 + (Math.random() * 7),
        MINEDUC: 83 + (Math.random() * 6)
      };
      
      // Round to 1 decimal
      Object.keys(monthData).forEach(key => {
        if (typeof monthData[key] === 'number') {
          monthData[key] = parseFloat(monthData[key].toFixed(1));
        }
      });
      
      data.push(monthData);
    }
    
    res.json({
      success: true,
      data,
      chartType: 'area',
      title: 'Ministry Performance Trends',
      xAxis: 'month',
      yAxis: 'performance'
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance trends data'
    });
  }
});

/**
 * GET /api/charts/all
 * Get all chart data for dashboard
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Simulate fetching all chart data
    const budgetExecution = await getBudgetExecutionData(12);
    const projectStatus = getProjectStatusData();
    const opportunities = getOpportunitiesData();
    const performance = getPerformanceData(6);
    
    res.json({
      success: true,
      data: {
        budgetExecution,
        projectStatus,
        opportunities,
        performance
      }
    });
  } catch (error) {
    console.error('Error fetching all charts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data'
    });
  }
});

// Helper functions
function getBudgetExecutionData(months) {
  return new Promise((resolve) => {
    const data = [];
    const now = new Date();
    const ministries = ['MININFRA', 'MINICT', 'MOH', 'MINEDUC'];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: date.toISOString().split('T')[0]
      };
      
      ministries.forEach(ministry => {
        const baseSpent = 70 + (i * 2);
        const variance = (Math.random() * 10) - 5;
        monthData[`${ministry}_spent`] = Math.min(95, baseSpent + variance);
        monthData[`${ministry}_allocated`] = 100;
      });
      
      data.push(monthData);
    }
    
    resolve(data);
  });
}

function getProjectStatusData() {
  return [
    { status: 'On Track', count: 28, percentage: 66.7, color: '#10b981' },
    { status: 'At Risk', count: 8, percentage: 19.0, color: '#f59e0b' },
    { status: 'Delayed', count: 4, percentage: 9.5, color: '#ef4444' },
    { status: 'Completed', count: 2, percentage: 4.8, color: '#3b82f6' }
  ];
}

function getOpportunitiesData() {
  return [
    { sector: 'Energy', count: 8, investment: 2500000000, avgROI: 18, riskLevel: 'MEDIUM' },
    { sector: 'Agriculture', count: 12, investment: 1800000000, avgROI: 22, riskLevel: 'LOW' },
    { sector: 'Tourism', count: 6, investment: 3200000000, avgROI: 15, riskLevel: 'MEDIUM' },
    { sector: 'Manufacturing', count: 10, investment: 4500000000, avgROI: 20, riskLevel: 'HIGH' },
    { sector: 'ICT', count: 9, investment: 2100000000, avgROI: 25, riskLevel: 'LOW' }
  ];
}

function getPerformanceData(months) {
  const data = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthData = {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      date: date.toISOString().split('T')[0],
      MININFRA: parseFloat((82 + (Math.random() * 8)).toFixed(1)),
      MINICT: parseFloat((90 + (Math.random() * 5)).toFixed(1)),
      MOH: parseFloat((85 + (Math.random() * 7)).toFixed(1)),
      MINEDUC: parseFloat((83 + (Math.random() * 6)).toFixed(1))
    };
    
    data.push(monthData);
  }
  
  return data;
}

module.exports = router;
