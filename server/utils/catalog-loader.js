const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * NISR Catalog Loader
 *
 * Loads the NISR Microdata catalog (73 datasets) for metadata attribution
 * and dataset browser features.
 */

const CATALOG_PATH = path.join(__dirname, '../../data/nisr-datasets/nisr-catalog.csv');

let catalogCache = null;

/**
 * Load NISR catalog from CSV
 * @returns {Promise<Array>} Array of dataset metadata objects
 */
async function loadCatalog() {
  if (catalogCache) {
    return catalogCache;
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CATALOG_PATH)) {
      console.warn('NISR catalog not found at:', CATALOG_PATH);
      resolve([]);
      return;
    }

    const results = [];

    fs.createReadStream(CATALOG_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Clean and structure the data
        results.push({
          id: row.id,
          surveyId: row.surveyid,
          title: row.titl,
          nation: row.nation,
          authority: row.authenty,
          dataCollectionStart: row.data_coll_start,
          dataCollectionEnd: row.data_coll_end,
          created: row.created,
          changed: row.changed,
        });
      })
      .on('end', () => {
        catalogCache = results;
        console.log(`✅ Loaded ${results.length} datasets from NISR catalog`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error loading NISR catalog:', error);
        reject(error);
      });
  });
}

/**
 * Get catalog entry by survey ID
 * @param {string} surveyId - NISR survey ID (e.g., "RWA-NISR-RLFS-2024-v0.1")
 * @returns {Object|null} Dataset metadata or null
 */
function getCatalogEntry(surveyId) {
  if (!catalogCache) return null;
  return catalogCache.find(entry => entry.surveyId === surveyId) || null;
}

/**
 * Search catalog by keyword
 * @param {string} keyword - Search term (e.g., "labor", "poverty", "2024")
 * @returns {Array} Matching datasets
 */
function searchCatalog(keyword) {
  if (!catalogCache) return [];

  const lowerKeyword = keyword.toLowerCase();

  return catalogCache.filter(entry =>
    entry.title.toLowerCase().includes(lowerKeyword) ||
    entry.surveyId.toLowerCase().includes(lowerKeyword) ||
    entry.dataCollectionStart === keyword ||
    entry.dataCollectionEnd === keyword
  );
}

/**
 * Get datasets by year
 * @param {string|number} year - Year to filter by
 * @returns {Array} Datasets from that year
 */
function getDatasetsByYear(year) {
  if (!catalogCache) return [];

  const yearStr = String(year);

  return catalogCache.filter(entry =>
    entry.dataCollectionStart === yearStr ||
    entry.dataCollectionEnd === yearStr
  );
}

/**
 * Get most recent datasets by category
 * @returns {Object} Object with categories and their most recent datasets
 */
function getRecentDatasets() {
  if (!catalogCache) return {};

  const categories = {
    labor: catalogCache.filter(e =>
      e.title.toLowerCase().includes('labour') ||
      e.title.toLowerCase().includes('labor')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    poverty: catalogCache.filter(e =>
      e.title.toLowerCase().includes('eicv') ||
      e.title.toLowerCase().includes('living conditions')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    population: catalogCache.filter(e =>
      e.title.toLowerCase().includes('population') &&
      e.title.toLowerCase().includes('census')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    agriculture: catalogCache.filter(e =>
      e.title.toLowerCase().includes('agriculture') ||
      e.title.toLowerCase().includes('agricultural')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    health: catalogCache.filter(e =>
      e.title.toLowerCase().includes('health') &&
      e.title.toLowerCase().includes('demographic')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    financial: catalogCache.filter(e =>
      e.title.toLowerCase().includes('finscope') ||
      e.title.toLowerCase().includes('financial')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],

    enterprise: catalogCache.filter(e =>
      e.title.toLowerCase().includes('establishment') ||
      e.title.toLowerCase().includes('enterprise')
    ).sort((a, b) =>
      parseInt(b.dataCollectionEnd || 0) - parseInt(a.dataCollectionEnd || 0)
    )[0],
  };

  return categories;
}

/**
 * Get catalog statistics
 * @returns {Object} Statistics about the catalog
 */
function getCatalogStats() {
  if (!catalogCache) return null;

  const stats = {
    totalDatasets: catalogCache.length,
    byCategory: {
      labor: catalogCache.filter(e => e.title.toLowerCase().includes('labour')).length,
      poverty: catalogCache.filter(e => e.title.toLowerCase().includes('eicv')).length,
      agriculture: catalogCache.filter(e => e.title.toLowerCase().includes('agriculture')).length,
      population: catalogCache.filter(e => e.title.toLowerCase().includes('census')).length,
      health: catalogCache.filter(e => e.title.toLowerCase().includes('health')).length,
      financial: catalogCache.filter(e => e.title.toLowerCase().includes('finscope')).length,
      enterprise: catalogCache.filter(e => e.title.toLowerCase().includes('establishment')).length,
    },
    yearRange: {
      earliest: Math.min(...catalogCache.map(e => parseInt(e.dataCollectionStart || 9999)).filter(y => y < 9999)),
      latest: Math.max(...catalogCache.map(e => parseInt(e.dataCollectionEnd || 0))),
    },
    recentDatasets: getRecentDatasets(),
  };

  return stats;
}

/**
 * Get full catalog
 * @returns {Array} All datasets
 */
function getFullCatalog() {
  return catalogCache || [];
}

module.exports = {
  loadCatalog,
  getCatalogEntry,
  searchCatalog,
  getDatasetsByYear,
  getRecentDatasets,
  getCatalogStats,
  getFullCatalog,
};
