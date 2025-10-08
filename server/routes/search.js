const express = require('express')
const { authenticateToken } = require('./auth')
const { search, getIndexStats } = require('../utils/search-indexer')

const router = express.Router()

/**
 * GET /api/search
 * Search across all indexed data sources using FlexSearch
 * 
 * Query params:
 * - q: Search query (required, min 2 chars)
 * - limit: Max results to return (default: 10)
 * - type: Filter by type (PROJECT, OPPORTUNITY, POLICY, INSIGHT, DATA, MINISTRY)
 * - sector: Filter by sector
 * - dateFrom: Filter by date range start (ISO date)
 * - dateTo: Filter by date range end (ISO date)
 */
router.get('/', authenticateToken, (req, res) => {
  const { 
    q, 
    limit = 10, 
    type = null,
    sector = null,
    dateFrom = null,
    dateTo = null
  } = req.query

  // Validate query
  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: [],
      message: 'Query too short (minimum 2 characters)',
      total: 0,
      query: q || ''
    })
  }

  try {
    // Build filter options
    const options = {
      limit: parseInt(limit, 10) || 10,
      type,
      sector
    }

    // Add date range if provided
    if (dateFrom || dateTo) {
      options.dateRange = {
        start: dateFrom,
        end: dateTo
      }
    }

    // Perform search using FlexSearch indexer
    const results = search(q.trim(), options)

    return res.json({
      success: true,
      data: results,
      total: results.length,
      query: q,
      filters: {
        type,
        sector,
        dateRange: options.dateRange
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    })
  }
})

/**
 * GET /api/search/stats
 * Get statistics about indexed search data
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = getIndexStats()
    return res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting search stats:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get search statistics'
    })
  }
})

module.exports = router
