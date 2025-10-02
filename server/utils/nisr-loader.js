const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * NISR Data Loader Utility
 *
 * This utility loads CSV files from the /data/nisr-datasets/ folder
 * and provides structured data for the Express API routes.
 *
 * Expected CSV files (to be added when NISR data arrives):
 * - poverty.csv - EICV poverty indicators by district/province
 * - labor.csv - Labour Force Survey data (employment, unemployment rates)
 * - gdp.csv - National Accounts GDP data by sector
 * - demographics.csv - Population statistics
 *
 * CSV Format Examples:
 *
 * poverty.csv:
 * Province,District,PovertyRate,ExtremePovertyRate,Year,Source
 * Kigali,Gasabo,12.5,3.2,2024,EICV5
 *
 * labor.csv:
 * Province,EmploymentRate,UnemploymentRate,YouthUnemployment,Sector,Year,Source
 * Kigali,78.3,16.7,23.4,Urban,2024,LFS Q2 2024
 *
 * gdp.csv:
 * Sector,GDPContribution,GrowthRate,Year,Quarter,Source
 * Agriculture,24.5,5.2,2024,Q2,National Accounts
 */

const DATA_DIR = path.join(__dirname, '../../data/nisr-datasets');

// Cache for loaded data to avoid re-reading files on every request
const dataCache = {
  poverty: null,
  labor: null,
  gdp: null,
  demographics: null,
  lastLoaded: null,
};

/**
 * Load a CSV file and parse it into an array of objects
 * @param {string} filename - Name of CSV file (e.g., 'poverty.csv')
 * @returns {Promise<Array>} Array of row objects
 */
function loadCSV(filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(DATA_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.warn(`NISR data file not found: ${filepath}`);
      resolve([]); // Return empty array instead of throwing error
      return;
    }

    const results = [];

    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        console.log(`Loaded ${results.length} rows from ${filename}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`Error loading ${filename}:`, error);
        reject(error);
      });
  });
}

/**
 * Load all NISR datasets into memory cache
 * Call this on server startup or when data needs to be refreshed
 */
async function loadAllNISRData() {
  try {
    console.log('Loading NISR datasets...');

    const [poverty, labor, gdp, demographics] = await Promise.all([
      loadCSV('poverty.csv'),
      loadCSV('labor.csv'),
      loadCSV('gdp.csv'),
      loadCSV('demographics.csv'),
    ]);

    dataCache.poverty = poverty;
    dataCache.labor = labor;
    dataCache.gdp = gdp;
    dataCache.demographics = demographics;
    dataCache.lastLoaded = new Date();

    const totalRows = poverty.length + labor.length + gdp.length + demographics.length;

    if (totalRows === 0) {
      console.warn('⚠️  No NISR data files found. Using mock data until CSV files are added to /data/nisr-datasets/');
    } else {
      console.log(`✅ Loaded ${totalRows} total rows from NISR datasets`);
      console.log(`   - Poverty: ${poverty.length} rows`);
      console.log(`   - Labor: ${labor.length} rows`);
      console.log(`   - GDP: ${gdp.length} rows`);
      console.log(`   - Demographics: ${demographics.length} rows`);
    }

    return dataCache;
  } catch (error) {
    console.error('Error loading NISR data:', error);
    throw error;
  }
}

/**
 * Get poverty data
 * @returns {Array} Poverty dataset rows
 */
function getPovertyData() {
  return dataCache.poverty || [];
}

/**
 * Get labor force data
 * @returns {Array} Labor dataset rows
 */
function getLaborData() {
  return dataCache.labor || [];
}

/**
 * Get GDP data
 * @returns {Array} GDP dataset rows
 */
function getGDPData() {
  return dataCache.gdp || [];
}

/**
 * Get demographics data
 * @returns {Array} Demographics dataset rows
 */
function getDemographicsData() {
  return dataCache.demographics || [];
}

/**
 * Check if NISR data is available (i.e., CSV files have been loaded)
 * @returns {boolean} True if data is loaded, false if using mock data
 */
function hasNISRData() {
  const totalRows =
    (dataCache.poverty?.length || 0) +
    (dataCache.labor?.length || 0) +
    (dataCache.gdp?.length || 0) +
    (dataCache.demographics?.length || 0);

  return totalRows > 0;
}

/**
 * Get aggregated statistics for dashboard
 * This processes raw NISR data into dashboard-friendly format
 */
function getDashboardStats() {
  if (!hasNISRData()) {
    return null; // Return null to signal mock data should be used
  }

  // Calculate statistics from NISR data
  const stats = {
    poverty: {
      nationalRate: calculateNationalAverage(dataCache.poverty, 'PovertyRate'),
      extremePovertyRate: calculateNationalAverage(dataCache.poverty, 'ExtremePovertyRate'),
      byProvince: groupByProvince(dataCache.poverty, 'PovertyRate'),
      source: 'NISR EICV5',
      year: getMostRecentYear(dataCache.poverty),
    },
    labor: {
      employmentRate: calculateNationalAverage(dataCache.labor, 'EmploymentRate'),
      unemploymentRate: calculateNationalAverage(dataCache.labor, 'UnemploymentRate'),
      youthUnemployment: calculateNationalAverage(dataCache.labor, 'YouthUnemployment'),
      byProvince: groupByProvince(dataCache.labor, 'UnemploymentRate'),
      source: 'NISR Labour Force Survey',
      year: getMostRecentYear(dataCache.labor),
    },
    gdp: {
      totalGrowth: calculateNationalAverage(dataCache.gdp, 'GrowthRate'),
      bySector: groupBy(dataCache.gdp, 'Sector', 'GDPContribution'),
      source: 'NISR National Accounts',
      year: getMostRecentYear(dataCache.gdp),
    },
    demographics: {
      totalPopulation: sum(dataCache.demographics, 'Population'),
      byProvince: groupByProvince(dataCache.demographics, 'Population'),
      source: 'NISR Population Projections',
      year: getMostRecentYear(dataCache.demographics),
    },
  };

  return stats;
}

// Helper functions for data aggregation

function calculateNationalAverage(data, field) {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + parseFloat(row[field] || 0), 0);
  return (sum / data.length).toFixed(2);
}

function groupByProvince(data, valueField) {
  if (!data) return {};
  const grouped = {};
  data.forEach(row => {
    const province = row.Province;
    if (province) {
      grouped[province] = parseFloat(row[valueField] || 0).toFixed(2);
    }
  });
  return grouped;
}

function groupBy(data, groupField, valueField) {
  if (!data) return {};
  const grouped = {};
  data.forEach(row => {
    const key = row[groupField];
    if (key) {
      grouped[key] = parseFloat(row[valueField] || 0).toFixed(2);
    }
  });
  return grouped;
}

function sum(data, field) {
  if (!data) return 0;
  return data.reduce((acc, row) => acc + parseFloat(row[field] || 0), 0);
}

function getMostRecentYear(data) {
  if (!data || data.length === 0) return new Date().getFullYear();
  const years = data.map(row => parseInt(row.Year || 0)).filter(y => y > 0);
  return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
}

module.exports = {
  loadAllNISRData,
  getPovertyData,
  getLaborData,
  getGDPData,
  getDemographicsData,
  hasNISRData,
  getDashboardStats,
};
