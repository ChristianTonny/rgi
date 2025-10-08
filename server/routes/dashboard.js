const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Mock database for dashboard data (in production, this would query actual database)
const mockDatabase = {
  projects: [
    { id: 1, name: 'National Infrastructure Upgrade', ministry: 'MININFRA', budget: 1500000000, spent: 1200000000, status: 'IN_PROGRESS', risk: 'MEDIUM', efficiency: 85 },
    { id: 2, name: 'ICT Digital Transformation', ministry: 'MINICT', budget: 800000000, spent: 650000000, status: 'IN_PROGRESS', risk: 'LOW', efficiency: 92 },
    { id: 3, name: 'Healthcare Modernization', ministry: 'MOH', budget: 1200000000, spent: 950000000, status: 'IN_PROGRESS', risk: 'HIGH', efficiency: 78 },
    { id: 4, name: 'Education Enhancement', ministry: 'MINEDUC', budget: 600000000, spent: 480000000, status: 'IN_PROGRESS', risk: 'LOW', efficiency: 88 }
  ],
  
  opportunities: [
    { id: 1, title: 'Solar Parks Development', sector: 'Energy', investment: 750000000, roi: 18, risk: 'MEDIUM', status: 'active' },
    { id: 2, name: 'Agricultural Processing', sector: 'Agriculture', investment: 350000000, roi: 22, risk: 'LOW', status: 'active' },
    { id: 3, title: 'Tourism Infrastructure', sector: 'Tourism', investment: 1500000000, roi: 15, risk: 'MEDIUM', status: 'active' },
    { id: 4, title: 'Manufacturing Zone', sector: 'Manufacturing', investment: 3500000000, roi: 20, risk: 'HIGH', status: 'active' }
  ],
  
  ministries: [
    { id: 1, name: 'MININFRA', budgetAllocated: 5000000000, budgetSpent: 3800000000, projects: 12, efficiency: 87 },
    { id: 2, name: 'MINICT', budgetAllocated: 3000000000, budgetSpent: 2700000000, projects: 8, efficiency: 92 },
    { id: 3, name: 'MOH', budgetAllocated: 8000000000, budgetSpent: 7100000000, projects: 15, efficiency: 89 },
    { id: 4, name: 'MINEDUC', budgetAllocated: 7000000000, budgetSpent: 5950000000, projects: 18, efficiency: 85 }
  ],
  
  performanceMetrics: [
    { ministry: 'MININFRA', indicator: 'Infrastructure Development', actual: 85, target: 90, period: 'Q4 2024' },
    { ministry: 'MINICT', indicator: 'Digital Adoption', actual: 92, target: 88, period: 'Q4 2024' },
    { ministry: 'MOH', indicator: 'Healthcare Access', actual: 89, target: 92, period: 'Q4 2024' },
    { ministry: 'MINEDUC', indicator: 'Education Quality', actual: 85, target: 87, period: 'Q4 2024' }
  ]
};

/**
 * GET /api/dashboard/resource-allocation
 * Get resource allocation data from database
 */
router.get('/resource-allocation', authenticateToken, (req, res) => {
  try {
    // Calculate from database
    const totalBudget = mockDatabase.ministries.reduce((sum, m) => sum + m.budgetAllocated, 0);
    const totalSpent = mockDatabase.ministries.reduce((sum, m) => sum + m.budgetSpent, 0);
    const totalProjects = mockDatabase.ministries.reduce((sum, m) => sum + m.projects, 0);
    const avgEfficiency = mockDatabase.ministries.reduce((sum, m) => sum + m.efficiency, 0) / mockDatabase.ministries.length;
    
    // Top ministries by budget
    const topMinistries = mockDatabase.ministries
      .map(m => ({
        name: m.name,
        allocated: m.budgetAllocated,
        spent: m.budgetSpent,
        efficiency: m.efficiency,
        utilization: (m.budgetSpent / m.budgetAllocated * 100).toFixed(1)
      }))
      .sort((a, b) => b.allocated - a.allocated)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        available: totalBudget - totalSpent,
        efficiency: avgEfficiency.toFixed(1),
        totalProjects,
        topMinistries
      }
    });
  } catch (error) {
    console.error('Error fetching resource allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resource allocation data'
    });
  }
});

/**
 * GET /api/dashboard/opportunity-radar
 * Get opportunity radar data from database
 */
router.get('/opportunity-radar', authenticateToken, (req, res) => {
  try {
    const opportunities = mockDatabase.opportunities.filter(o => o.status === 'active');
    
    const totalOpportunities = opportunities.length;
    const highPriorityOpportunities = opportunities.filter(o => o.roi > 20).length;
    const totalInvestment = opportunities.reduce((sum, o) => sum + o.investment, 0);
    const avgROI = opportunities.reduce((sum, o) => sum + o.roi, 0) / totalOpportunities;
    
    // Group by sector
    const bySector = opportunities.reduce((acc, o) => {
      if (!acc[o.sector]) {
        acc[o.sector] = { count: 0, investment: 0, avgROI: 0 };
      }
      acc[o.sector].count++;
      acc[o.sector].investment += o.investment;
      return acc;
    }, {});
    
    // Calculate average ROI per sector
    Object.keys(bySector).forEach(sector => {
      const sectorOpps = opportunities.filter(o => o.sector === sector);
      bySector[sector].avgROI = sectorOpps.reduce((sum, o) => sum + o.roi, 0) / sectorOpps.length;
    });
    
    res.json({
      success: true,
      data: {
        totalOpportunities,
        highPriorityOpportunities,
        totalInvestment,
        avgROI: avgROI.toFixed(1),
        bySector
      }
    });
  } catch (error) {
    console.error('Error fetching opportunity radar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity data'
    });
  }
});

/**
 * GET /api/dashboard/performance-monitor
 * Get performance monitoring data from database
 */
router.get('/performance-monitor', authenticateToken, (req, res) => {
  try {
    const projects = mockDatabase.projects;
    const metrics = mockDatabase.performanceMetrics;
    
    const totalProjects = projects.length;
    const projectsAtRisk = projects.filter(p => p.risk === 'HIGH' || p.risk === 'MEDIUM').length;
    const onTimeDelivery = projects.filter(p => p.status === 'IN_PROGRESS' && p.efficiency > 80).length / totalProjects * 100;
    const avgQuality = projects.reduce((sum, p) => sum + p.efficiency, 0) / totalProjects;
    
    // Ministry performance
    const ministryPerformance = metrics.map(m => ({
      ministry: m.ministry,
      indicator: m.indicator,
      actual: m.actual,
      target: m.target,
      achievement: (m.actual / m.target * 100).toFixed(1)
    }));
    
    res.json({
      success: true,
      data: {
        totalProjects,
        projectsAtRisk,
        onTimeDelivery: onTimeDelivery.toFixed(1),
        qualityScore: avgQuality.toFixed(1),
        ministryPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching performance monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    });
  }
});

/**
 * GET /api/dashboard/summary
 * Get complete dashboard summary
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // Fetch all dashboard data in parallel
    const resourceAllocation = await getResourceAllocation();
    const opportunityRadar = await getOpportunityRadar();
    const performanceMonitor = await getPerformanceMonitor();
    
    res.json({
      success: true,
      data: {
        resourceAllocation,
        opportunityRadar,
        performanceMonitor,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary'
    });
  }
});

// Helper functions
function getResourceAllocation() {
  const totalBudget = mockDatabase.ministries.reduce((sum, m) => sum + m.budgetAllocated, 0);
  const totalSpent = mockDatabase.ministries.reduce((sum, m) => sum + m.budgetSpent, 0);
  const avgEfficiency = mockDatabase.ministries.reduce((sum, m) => sum + m.efficiency, 0) / mockDatabase.ministries.length;
  
  return {
    totalBudget,
    totalSpent,
    available: totalBudget - totalSpent,
    efficiency: avgEfficiency.toFixed(1)
  };
}

function getOpportunityRadar() {
  const opportunities = mockDatabase.opportunities.filter(o => o.status === 'active');
  const totalInvestment = opportunities.reduce((sum, o) => sum + o.investment, 0);
  
  return {
    totalOpportunities: opportunities.length,
    highPriorityOpportunities: opportunities.filter(o => o.roi > 20).length,
    totalInvestment
  };
}

function getPerformanceMonitor() {
  const projects = mockDatabase.projects;
  
  return {
    totalProjects: projects.length,
    projectsAtRisk: projects.filter(p => p.risk === 'HIGH' || p.risk === 'MEDIUM').length,
    onTimeDelivery: (projects.filter(p => p.efficiency > 80).length / projects.length * 100).toFixed(1)
  };
}

module.exports = router;
