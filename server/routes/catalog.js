const express = require('express');
const { authenticateToken } = require('./auth');
const {
  getFullCatalog,
  getCatalogStats,
  searchCatalog,
  getDatasetsByYear,
  getRecentDatasets,
  getCatalogEntry,
} = require('../utils/catalog-loader');

const router = express.Router();

/**
 * GET /api/catalog
 * Returns full NISR catalog (73 datasets)
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const catalog = getFullCatalog();

    return res.json({
      success: true,
      data: catalog,
      total: catalog.length,
      message: `${catalog.length} NISR datasets available`,
    });
  } catch (error) {
    console.error('Catalog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load NISR catalog',
    });
  }
});

/**
 * GET /api/catalog/stats
 * Returns catalog statistics
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = getCatalogStats();

    if (!stats) {
      return res.json({
        success: false,
        message: 'Catalog not loaded',
      });
    }

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Catalog stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get catalog statistics',
    });
  }
});

/**
 * GET /api/catalog/search?q=keyword
 * Search NISR catalog
 */
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query required',
      });
    }

    const results = searchCatalog(q);

    return res.json({
      success: true,
      data: results,
      total: results.length,
      query: q,
    });
  } catch (error) {
    console.error('Catalog search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search catalog',
    });
  }
});

/**
 * GET /api/catalog/year/:year
 * Get datasets by year
 */
router.get('/year/:year', authenticateToken, (req, res) => {
  try {
    const { year } = req.params;
    const results = getDatasetsByYear(year);

    return res.json({
      success: true,
      data: results,
      total: results.length,
      year: parseInt(year),
    });
  } catch (error) {
    console.error('Catalog year filter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to filter by year',
    });
  }
});

/**
 * GET /api/catalog/recent
 * Get most recent dataset in each category
 */
router.get('/recent', authenticateToken, (req, res) => {
  try {
    const recent = getRecentDatasets();

    return res.json({
      success: true,
      data: recent,
    });
  } catch (error) {
    console.error('Recent datasets error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recent datasets',
    });
  }
});

/**
 * GET /api/catalog/:surveyId
 * Get specific dataset metadata
 */
router.get('/:surveyId', authenticateToken, (req, res) => {
  try {
    const { surveyId } = req.params;
    const dataset = getCatalogEntry(surveyId);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found',
      });
    }

    return res.json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    console.error('Catalog entry error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dataset',
    });
  }
});

module.exports = router;
