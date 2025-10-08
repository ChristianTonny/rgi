const FlexSearch = require('flexsearch');
const { 
  getPovertyData, 
  getLaborData, 
  getGDPData, 
  getDemographicsData 
} = require('./nisr-loader');

/**
 * Search Indexer Utility
 * 
 * Uses FlexSearch to index all searchable content:
 * - Projects
 * - Opportunities
 * - Ministries
 * - NISR datasets (poverty, labor, GDP, demographics)
 * - Policies
 * - Insights
 */

// Create FlexSearch Document index
const searchIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['title', 'content', 'keywords'],
    store: ['type', 'title', 'content', 'source', 'metadata', 'createdAt']
  },
  tokenize: 'forward',
  cache: 100,
  context: {
    resolution: 9,
    depth: 2,
    bidirectional: true
  }
});

// In-memory storage for full documents (FlexSearch only stores indexed fields)
const documentStore = new Map();

/**
 * Mock data for projects, opportunities, etc.
 * In a real system, these would come from a database
 */
const mockProjects = [
  {
    id: 'proj-1',
    type: 'PROJECT',
    title: 'National Infrastructure Upgrade',
    content: 'Modernizing road and bridge infrastructure across all provinces',
    keywords: 'infrastructure roads bridges construction development',
    source: { name: 'Ministry of Infrastructure' },
    metadata: { budget: 1_500_000_000, status: 'IN_PROGRESS' },
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'proj-2',
    type: 'PROJECT',
    title: 'ICT Digital Transformation Initiative',
    content: 'Implementing e-governance platforms and digital services for citizens',
    keywords: 'digital ict technology governance transformation',
    source: { name: 'Ministry of ICT' },
    metadata: { budget: 800_000_000, status: 'IN_PROGRESS' },
    createdAt: new Date('2024-02-20').toISOString()
  },
  {
    id: 'proj-3',
    type: 'PROJECT',
    title: 'Healthcare System Modernization',
    content: 'Upgrading healthcare facilities and implementing electronic health records',
    keywords: 'healthcare health hospitals medical modernization',
    source: { name: 'Ministry of Health' },
    metadata: { budget: 1_200_000_000, status: 'PLANNING' },
    createdAt: new Date('2024-03-10').toISOString()
  },
  {
    id: 'proj-4',
    type: 'PROJECT',
    title: 'Education Quality Enhancement Program',
    content: 'Improving teaching methods and learning facilities in primary schools',
    keywords: 'education schools teachers students learning quality',
    source: { name: 'Ministry of Education' },
    metadata: { budget: 600_000_000, status: 'IN_PROGRESS' },
    createdAt: new Date('2024-01-05').toISOString()
  }
];

const mockOpportunities = [
  {
    id: 'opp-1',
    type: 'OPPORTUNITY',
    title: 'Renewable Energy Investment - Solar Parks',
    content: 'Investment opportunity in 50MW solar park development in Eastern Province',
    keywords: 'solar renewable energy investment green power electricity',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '500M-1B RWF', sector: 'Energy', riskLevel: 'MEDIUM' },
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    id: 'opp-2',
    type: 'OPPORTUNITY',
    title: 'Agricultural Processing Plant',
    content: 'Coffee and tea processing facility expansion opportunity',
    keywords: 'agriculture coffee tea processing farming export',
    source: { name: 'Ministry of Agriculture' },
    metadata: { investmentRange: '200M-500M RWF', sector: 'Agriculture', riskLevel: 'LOW' },
    createdAt: new Date('2024-03-15').toISOString()
  },
  {
    id: 'opp-3',
    type: 'OPPORTUNITY',
    title: 'Tourism Infrastructure Development',
    content: 'Eco-tourism lodges and visitor centers in national parks',
    keywords: 'tourism hotels lodges parks wildlife gorillas visitors',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '1B-2B RWF', sector: 'Tourism', riskLevel: 'MEDIUM' },
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 'opp-4',
    type: 'OPPORTUNITY',
    title: 'Manufacturing Zone Development',
    content: 'Industrial park for textile and garment manufacturing',
    keywords: 'manufacturing industry textiles garments factory production',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '2B-5B RWF', sector: 'Manufacturing', riskLevel: 'HIGH' },
    createdAt: new Date('2024-02-28').toISOString()
  }
];

const mockPolicies = [
  {
    id: 'policy-1',
    type: 'POLICY',
    title: 'Digital Economy Policy Framework 2024',
    content: 'New framework for digital economy growth and innovation support',
    keywords: 'digital policy economy innovation technology framework',
    source: { name: 'Ministry of ICT' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-01-01' },
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'policy-2',
    type: 'POLICY',
    title: 'Green Growth Strategy',
    content: 'National strategy for sustainable development and environmental protection',
    keywords: 'environment green growth sustainability climate protection',
    source: { name: 'Ministry of Environment' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-03-01' },
    createdAt: new Date('2024-03-01').toISOString()
  }
];

const mockInsights = [
  {
    id: 'insight-1',
    type: 'INSIGHT',
    title: 'Budget Efficiency Analysis Q4 2024',
    content: 'Analysis shows 12% improvement in budget utilization across ministries',
    keywords: 'budget efficiency analysis utilization ministries financial',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'BUDGET', confidence: 0.92 },
    createdAt: new Date('2024-10-01').toISOString()
  },
  {
    id: 'insight-2',
    type: 'INSIGHT',
    title: 'Project Risk Assessment - Infrastructure',
    content: 'Three infrastructure projects require immediate attention due to timeline delays',
    keywords: 'risk assessment infrastructure projects delays timeline',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'RISK', confidence: 0.88 },
    createdAt: new Date('2024-09-15').toISOString()
  }
];

const mockMinistries = [
  {
    id: 'ministry-1',
    type: 'MINISTRY',
    title: 'Ministry of Infrastructure (MININFRA)',
    content: 'Responsible for infrastructure development including roads, bridges, and public works',
    keywords: 'infrastructure mininfra roads bridges construction public works',
    source: { name: 'Government of Rwanda' },
    metadata: { sector: 'Infrastructure', budget: 5000000000 },
    createdAt: new Date('2020-01-01').toISOString()
  },
  {
    id: 'ministry-2',
    type: 'MINISTRY',
    title: 'Ministry of ICT and Innovation (MINICT)',
    content: 'Leads digital transformation and ICT development in Rwanda',
    keywords: 'ict innovation technology digital minict transformation',
    source: { name: 'Government of Rwanda' },
    metadata: { sector: 'Technology', budget: 3000000000 },
    createdAt: new Date('2020-01-01').toISOString()
  },
  {
    id: 'ministry-3',
    type: 'MINISTRY',
    title: 'Ministry of Health (MOH)',
    content: 'Oversees healthcare system and public health initiatives',
    keywords: 'health healthcare moh hospitals medical public health',
    source: { name: 'Government of Rwanda' },
    metadata: { sector: 'Health', budget: 8000000000 },
    createdAt: new Date('2020-01-01').toISOString()
  },
  {
    id: 'ministry-4',
    type: 'MINISTRY',
    title: 'Ministry of Education (MINEDUC)',
    content: 'Manages education system from primary to higher education',
    keywords: 'education mineduc schools universities students teachers',
    source: { name: 'Government of Rwanda' },
    metadata: { sector: 'Education', budget: 7000000000 },
    createdAt: new Date('2020-01-01').toISOString()
  }
];

/**
 * Convert NISR CSV data to searchable documents
 */
function convertNISRDataToDocuments() {
  const documents = [];
  let idCounter = 1;

  // Index Poverty data
  const povertyData = getPovertyData();
  povertyData.forEach(row => {
    documents.push({
      id: `nisr-poverty-${idCounter++}`,
      type: 'DATA',
      title: `Poverty Data - ${row.Province} ${row.District !== 'National' ? '(' + row.District + ')' : ''}`,
      content: `Poverty rate: ${row.PovertyRate}%, Extreme poverty: ${row.ExtremePovertyRate}% in ${row.Province} ${row.District !== 'National' ? row.District : ''} (${row.Year})`,
      keywords: `poverty eicv statistics ${row.Province} ${row.District} ${row.Year}`,
      source: { name: row.Source || 'NISR EICV' },
      metadata: { 
        province: row.Province,
        district: row.District,
        povertyRate: row.PovertyRate,
        extremePovertyRate: row.ExtremePovertyRate,
        year: row.Year
      },
      createdAt: new Date().toISOString()
    });
  });

  // Index Labor data
  const laborData = getLaborData();
  laborData.forEach(row => {
    documents.push({
      id: `nisr-labor-${idCounter++}`,
      type: 'DATA',
      title: `Labor Statistics - ${row.Province}`,
      content: `Employment rate: ${row.EmploymentRate}%, Unemployment: ${row.UnemploymentRate}%, Youth unemployment: ${row.YouthUnemployment}% (${row.Year})`,
      keywords: `labor employment unemployment statistics ${row.Province} ${row.Year}`,
      source: { name: row.Source || 'NISR Labour Force Survey' },
      metadata: {
        province: row.Province,
        employmentRate: row.EmploymentRate,
        unemploymentRate: row.UnemploymentRate,
        youthUnemployment: row.YouthUnemployment,
        year: row.Year
      },
      createdAt: new Date().toISOString()
    });
  });

  // Index GDP data
  const gdpData = getGDPData();
  gdpData.forEach(row => {
    documents.push({
      id: `nisr-gdp-${idCounter++}`,
      type: 'DATA',
      title: `GDP Statistics - ${row.Sector}`,
      content: `GDP contribution: ${row.GDPContribution}%, Growth rate: ${row.GrowthRate}% for ${row.Sector} sector (${row.Year} Q${row.Quarter})`,
      keywords: `gdp economy growth sector ${row.Sector} ${row.Year}`,
      source: { name: row.Source || 'NISR National Accounts' },
      metadata: {
        sector: row.Sector,
        gdpContribution: row.GDPContribution,
        growthRate: row.GrowthRate,
        year: row.Year,
        quarter: row.Quarter
      },
      createdAt: new Date().toISOString()
    });
  });

  // Index Demographics data
  const demographicsData = getDemographicsData();
  demographicsData.forEach(row => {
    documents.push({
      id: `nisr-demographics-${idCounter++}`,
      type: 'DATA',
      title: `Population Data - ${row.Province}`,
      content: `Population: ${row.Population} in ${row.Province} (${row.Year})`,
      keywords: `population demographics statistics ${row.Province} ${row.Year}`,
      source: { name: row.Source || 'NISR Population Projections' },
      metadata: {
        province: row.Province,
        population: row.Population,
        year: row.Year
      },
      createdAt: new Date().toISOString()
    });
  });

  return documents;
}

/**
 * Initialize search index with all data sources
 */
async function initializeSearchIndex() {
  try {
    console.log('Initializing FlexSearch index...');

    // Clear existing index
    documentStore.clear();

    // Combine all data sources
    const allDocuments = [
      ...mockProjects,
      ...mockOpportunities,
      ...mockPolicies,
      ...mockInsights,
      ...mockMinistries,
      ...convertNISRDataToDocuments()
    ];

    // Add each document to FlexSearch index and store
    allDocuments.forEach(doc => {
      searchIndex.add(doc);
      documentStore.set(doc.id, doc);
    });

    console.log(`✅ Search index initialized with ${allDocuments.length} documents`);
    console.log(`   - Projects: ${mockProjects.length}`);
    console.log(`   - Opportunities: ${mockOpportunities.length}`);
    console.log(`   - Policies: ${mockPolicies.length}`);
    console.log(`   - Insights: ${mockInsights.length}`);
    console.log(`   - Ministries: ${mockMinistries.length}`);
    console.log(`   - NISR Data: ${convertNISRDataToDocuments().length}`);

    return true;
  } catch (error) {
    console.error('Error initializing search index:', error);
    throw error;
  }
}

/**
 * Search across all indexed documents
 * @param {string} query - Search query
 * @param {Object} options - Search options (limit, filters)
 * @returns {Array} Search results with relevance scores
 */
function search(query, options = {}) {
  const { 
    limit = 10, 
    type = null,
    sector = null,
    dateRange = null 
  } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Perform search using FlexSearch
    const searchResults = searchIndex.search(query, { limit: limit * 3 }); // Get more results for filtering

    // FlexSearch returns an array of results per field
    // Combine and deduplicate results
    const resultIds = new Set();
    const combinedResults = [];

    searchResults.forEach(fieldResults => {
      if (fieldResults.result) {
        fieldResults.result.forEach(id => {
          if (!resultIds.has(id)) {
            resultIds.add(id);
            const doc = documentStore.get(id);
            if (doc) {
              combinedResults.push(doc);
            }
          }
        });
      }
    });

    // Apply filters
    let filteredResults = combinedResults;

    if (type) {
      filteredResults = filteredResults.filter(doc => 
        doc.type.toUpperCase() === type.toUpperCase()
      );
    }

    if (sector && filteredResults.length > 0) {
      filteredResults = filteredResults.filter(doc => 
        doc.metadata?.sector?.toLowerCase().includes(sector.toLowerCase()) ||
        doc.keywords?.toLowerCase().includes(sector.toLowerCase())
      );
    }

    if (dateRange && dateRange.start && dateRange.end) {
      filteredResults = filteredResults.filter(doc => {
        const docDate = new Date(doc.createdAt);
        return docDate >= new Date(dateRange.start) && docDate <= new Date(dateRange.end);
      });
    }

    // Limit results
    return filteredResults.slice(0, limit);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Get statistics about indexed data
 */
function getIndexStats() {
  return {
    totalDocuments: documentStore.size,
    types: {
      projects: mockProjects.length,
      opportunities: mockOpportunities.length,
      policies: mockPolicies.length,
      insights: mockInsights.length,
      ministries: mockMinistries.length,
      nisrData: convertNISRDataToDocuments().length
    }
  };
}

module.exports = {
  initializeSearchIndex,
  search,
  getIndexStats
};
