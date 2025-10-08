const express = require('express');
const { authenticateToken } = require('./auth');
const { logActivity, ACTIVITY_TYPES } = require('./activity');

const router = express.Router();

// In-memory storage for opportunities data
const opportunities = new Map([
  ['opp-1', {
    id: 'opp-1',
    title: 'Solar Energy Parks Development',
    sector: 'Energy',
    location: 'Eastern Province',
    investmentMin: 2000000000, // 2B RWF
    investmentMax: 3000000000, // 3B RWF
    roi: 18,
    riskLevel: 'MEDIUM',
    status: 'OPEN',
    description: 'Development of solar energy parks to support renewable energy goals',
    marketSize: 5000000000,
    competitionLevel: 'MEDIUM',
    infrastructureRequirements: ['Land', 'Grid Connection', 'Storage Facilities'],
    timeline: '24-36 months',
    createdAt: new Date('2024-01-15').toISOString()
  }],
  ['opp-2', {
    id: 'opp-2',
    title: 'Agricultural Processing Facility',
    sector: 'Agriculture',
    location: 'Northern Province',
    investmentMin: 1500000000, // 1.5B RWF
    investmentMax: 2200000000, // 2.2B RWF
    roi: 22,
    riskLevel: 'LOW',
    status: 'OPEN',
    description: 'Modern facility for processing agricultural products for export',
    marketSize: 8000000000,
    competitionLevel: 'LOW',
    infrastructureRequirements: ['Factory Building', 'Cold Storage', 'Transport'],
    timeline: '18-24 months',
    createdAt: new Date('2024-02-10').toISOString()
  }],
  ['opp-3', {
    id: 'opp-3',
    title: 'Tourism Infrastructure Development',
    sector: 'Tourism',
    location: 'Western Province',
    investmentMin: 3000000000, // 3B RWF
    investmentMax: 4000000000, // 4B RWF
    roi: 15,
    riskLevel: 'MEDIUM',
    status: 'OPEN',
    description: 'Development of eco-tourism facilities including lodges and activity centers',
    marketSize: 10000000000,
    competitionLevel: 'HIGH',
    infrastructureRequirements: ['Accommodation', 'Roads', 'Utilities'],
    timeline: '36-48 months',
    createdAt: new Date('2024-03-01').toISOString()
  }],
  ['opp-4', {
    id: 'opp-4',
    title: 'Manufacturing Zone Expansion',
    sector: 'Manufacturing',
    location: 'Kigali',
    investmentMin: 4000000000, // 4B RWF
    investmentMax: 5500000000, // 5.5B RWF
    roi: 20,
    riskLevel: 'HIGH',
    status: 'OPEN',
    description: 'Expansion of special economic zone for manufacturing and assembly',
    marketSize: 15000000000,
    competitionLevel: 'MEDIUM',
    infrastructureRequirements: ['Factory Space', 'Utilities', 'Logistics Hub'],
    timeline: '24-30 months',
    createdAt: new Date('2024-01-20').toISOString()
  }]
]);

// Watchlist storage (userId -> opportunityIds)
const watchlists = new Map();

// Expression of interest storage
const expressionsOfInterest = new Map();

/**
 * GET /api/opportunities
 * Get all opportunities with optional filters
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const {
      sectors,
      investmentMin,
      investmentMax,
      riskLevels,
      minROI,
      regions,
      status,
      search
    } = req.query;
    
    let filteredOpportunities = Array.from(opportunities.values());
    
    // Apply filters
    if (sectors) {
      const sectorList = sectors.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        sectorList.includes(opp.sector)
      );
    }
    
    if (investmentMin) {
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.investmentMax >= parseFloat(investmentMin)
      );
    }
    
    if (investmentMax) {
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.investmentMin <= parseFloat(investmentMax)
      );
    }
    
    if (riskLevels) {
      const riskList = riskLevels.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        riskList.includes(opp.riskLevel)
      );
    }
    
    if (minROI) {
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.roi >= parseFloat(minROI)
      );
    }
    
    if (regions) {
      const regionList = regions.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        regionList.some(region => opp.location.includes(region))
      );
    }
    
    if (status) {
      const statusList = status.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        statusList.includes(opp.status)
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchLower) ||
        opp.description.toLowerCase().includes(searchLower) ||
        opp.sector.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: filteredOpportunities,
      total: filteredOpportunities.length,
      filters: { sectors, investmentMin, investmentMax, riskLevels, minROI, regions, status }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities'
    });
  }
});

/**
 * GET /api/opportunities/:id
 * Get a specific opportunity
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = opportunities.get(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }
    
    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity'
    });
  }
});

/**
 * GET /api/opportunities/watchlist/my
 * Get user's watchlist
 */
router.get('/watchlist/my', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userWatchlist = watchlists.get(userId) || [];
    
    const watchlistOpportunities = userWatchlist
      .map(oppId => opportunities.get(oppId))
      .filter(Boolean);
    
    res.json({
      success: true,
      data: watchlistOpportunities,
      count: watchlistOpportunities.length
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch watchlist'
    });
  }
});

/**
 * POST /api/opportunities/:id/watchlist
 * Add opportunity to watchlist
 */
router.post('/:id/watchlist', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;
    
    const opportunity = opportunities.get(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }
    
    if (!watchlists.has(userId)) {
      watchlists.set(userId, []);
    }
    
    const userWatchlist = watchlists.get(userId);
    if (!userWatchlist.includes(id)) {
      userWatchlist.push(id);
    }
    
    // Log activity
    logActivity({
      userId,
      activityType: ACTIVITY_TYPES.OPPORTUNITY_PUBLISHED,
      title: 'Added to Watchlist',
      description: `Added "${opportunity.title}" to watchlist`,
      entityType: 'opportunity',
      entityId: id,
      metadata: { notes }
    });
    
    res.json({
      success: true,
      message: 'Added to watchlist',
      data: { opportunityId: id, notes }
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to watchlist'
    });
  }
});

/**
 * DELETE /api/opportunities/:id/watchlist
 * Remove opportunity from watchlist
 */
router.delete('/:id/watchlist', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (watchlists.has(userId)) {
      const userWatchlist = watchlists.get(userId);
      const index = userWatchlist.indexOf(id);
      if (index > -1) {
        userWatchlist.splice(index, 1);
      }
    }
    
    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from watchlist'
    });
  }
});

/**
 * POST /api/opportunities/:id/express-interest
 * Express interest in an opportunity
 */
router.post('/:id/express-interest', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      organizationName,
      contactPerson,
      email,
      phone,
      investmentCapacity,
      proposedTimeline,
      notes
    } = req.body;
    
    const opportunity = opportunities.get(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }
    
    const interestId = `interest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expressionOfInterest = {
      id: interestId,
      opportunityId: id,
      userId,
      organizationName,
      contactPerson,
      email,
      phone,
      investmentCapacity,
      proposedTimeline,
      notes,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    
    expressionsOfInterest.set(interestId, expressionOfInterest);
    
    // Log activity
    logActivity({
      userId,
      activityType: ACTIVITY_TYPES.OPPORTUNITY_PUBLISHED,
      title: 'Expressed Interest',
      description: `Expressed interest in "${opportunity.title}"`,
      entityType: 'opportunity',
      entityId: id,
      metadata: { interestId, organizationName }
    });
    
    res.status(201).json({
      success: true,
      message: 'Interest expressed successfully',
      data: expressionOfInterest
    });
  } catch (error) {
    console.error('Error expressing interest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to express interest'
    });
  }
});

/**
 * GET /api/opportunities/:id/prospectus
 * Download opportunity prospectus
 */
router.get('/:id/prospectus', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = opportunities.get(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }
    
    // Generate prospectus data
    const prospectus = {
      id: `prospectus_${id}`,
      opportunityId: id,
      title: `Investment Prospectus: ${opportunity.title}`,
      sections: {
        overview: {
          title: opportunity.title,
          sector: opportunity.sector,
          location: opportunity.location,
          status: opportunity.status
        },
        investment: {
          range: `${(opportunity.investmentMin / 1000000000).toFixed(1)}B - ${(opportunity.investmentMax / 1000000000).toFixed(1)}B RWF`,
          roi: `${opportunity.roi}%`,
          timeline: opportunity.timeline
        },
        market: {
          size: `${(opportunity.marketSize / 1000000000).toFixed(1)}B RWF`,
          competition: opportunity.competitionLevel
        },
        risk: {
          level: opportunity.riskLevel,
          assessment: getRiskAssessment(opportunity.riskLevel)
        },
        infrastructure: opportunity.infrastructureRequirements,
        contact: {
          email: 'investments@gov.rw',
          phone: '+250 788 000 000'
        }
      },
      downloadUrl: `/downloads/prospectus_${id}.pdf`,
      generatedAt: new Date().toISOString()
    };
    
    // Log activity
    logActivity({
      userId: req.user.id,
      activityType: ACTIVITY_TYPES.REPORT_EXPORTED,
      title: 'Prospectus Downloaded',
      description: `Downloaded prospectus for "${opportunity.title}"`,
      entityType: 'opportunity',
      entityId: id,
      metadata: { format: 'PDF' }
    });
    
    res.json({
      success: true,
      data: prospectus
    });
  } catch (error) {
    console.error('Error generating prospectus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prospectus'
    });
  }
});

/**
 * POST /api/opportunities/:id/analyze
 * Create analysis conversation for an opportunity
 */
router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = opportunities.get(id);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }
    
    // This would typically create a conversation via the conversations API
    // For now, return the data needed for the frontend to create the conversation
    res.json({
      success: true,
      data: {
        opportunity,
        conversationContext: {
          type: 'opportunity_analysis',
          opportunityId: id,
          opportunityTitle: opportunity.title
        },
        suggestedTitle: `Analysis: ${opportunity.title}`,
        navigationUrl: `/intelligence?action=analyze-opportunity&id=${id}`
      }
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create analysis'
    });
  }
});

/**
 * GET /api/opportunities/export/pipeline
 * Export opportunities pipeline data
 */
router.get('/export/pipeline', authenticateToken, (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const allOpportunities = Array.from(opportunities.values());
    
    const exportData = {
      id: `export_${Date.now()}`,
      format,
      data: allOpportunities,
      filename: `opportunities_pipeline_${new Date().toISOString().split('T')[0]}.${format}`,
      downloadUrl: `/downloads/opportunities_pipeline.${format}`,
      generatedAt: new Date().toISOString(),
      recordCount: allOpportunities.length
    };
    
    // Log activity
    logActivity({
      userId: req.user.id,
      activityType: ACTIVITY_TYPES.REPORT_EXPORTED,
      title: 'Pipeline Exported',
      description: `Exported opportunities pipeline (${format.toUpperCase()})`,
      entityType: 'opportunity',
      entityId: 'pipeline',
      metadata: { format, count: allOpportunities.length }
    });
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting pipeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export pipeline'
    });
  }
});

// Helper function
function getRiskAssessment(riskLevel) {
  const assessments = {
    LOW: 'Low risk with stable market conditions and established infrastructure',
    MEDIUM: 'Moderate risk with some market uncertainty and infrastructure development needs',
    HIGH: 'Higher risk with significant market volatility and substantial infrastructure investment required'
  };
  return assessments[riskLevel] || 'Risk assessment pending';
}

module.exports = router;