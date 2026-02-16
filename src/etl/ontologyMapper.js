/**
 * Enhanced Ontology Mapper with Canonical Mapping and Advanced Features
 */

// Comprehensive canonical mapping with categories and transformations
const canonicalMap = {
  // Basic identifiers
  id: ["id", "uid", "identifier", "code", "key", "index"],
  name: ["name", "entity", "title", "label", "description"],
  
  // Geographic entities
  country: ["country", "nation", "state", "territory"],
  province: ["province", "region", "state", "division"],
  district: ["district", "county", "area", "zone", "locality"],
  sector: ["sector", "subcounty", "ward", "commune"],
  cell: ["cell", "village", "subward", "parish"],
  
  // Temporal dimensions
  year: ["year", "yr", "date_year", "annual", "fiscal_year"],
  month: ["month", "mnth", "period_month"],
  quarter: ["quarter", "qtr", "period_quarter"],
  date: ["date", "timestamp", "time", "period"],
  
  // Demographic data
  population: ["population", "pop", "total_population", "inhabitants", "residents"],
  male: ["male", "m", "men", "boys", "male_population"],
  female: ["female", "f", "women", "girls", "female_population"],
  children: ["children", "child", "minors", "under_18"],
  youth: ["youth", "young", "15_24", "young_adults"],
  adults: ["adults", "adult", "grown_ups", "15_plus"],
  elderly: ["elderly", "seniors", "old", "65_plus", "retired"],
  
  // Economic indicators
  gdp: ["gdp", "gross_domestic_product", "gdp_usd", "gdp_current_us", "economic_output"],
  gdp_growth: ["gdp_growth", "economic_growth", "growth_rate", "gdp_growth_rate"],
  gdp_per_capita: ["gdp_per_capita", "income_per_capita", "gdp_pc", "per_capita_income"],
  inflation: ["inflation", "inflation_rate", "cpi", "consumer_price_index"],
  unemployment: ["unemployment", "unemployment_rate", "jobless_rate"],
  
  // Poverty and social indicators
  poverty: ["poverty", "poverty_rate", "poor", "poverty_incidence"],
  poverty_gap: ["poverty_gap", "poverty_depth", "poverty_gap_index"],
  inequality: ["inequality", "gini", "gini_coefficient", "gini_index", "income_inequality"],
  literacy: ["literacy", "literacy_rate", "adult_literacy"],
  
  // Education
  education: ["education", "schooling", "educational"],
  primary: ["primary", "primary_education", "elementary", "prim"],
  secondary: ["secondary", "secondary_education", "high_school", "sec"],
  tertiary: ["tertiary", "tertiary_education", "higher_education", "university", "tert"],
  no_education: ["no_education", "illiterate", "no_schooling", "unschooled"],
  
  // Health
  health: ["health", "healthcare", "medical"],
  life_expectancy: ["life_expectancy", "life_span", "longevity"],
  mortality: ["mortality", "death_rate", "mortality_rate"],
  malnutrition: ["malnutrition", "undernourishment", "hunger"],
  
  // Agriculture
  agriculture: ["agriculture", "farming", "agricultural"],
  crops: ["crops", "crop_production", "harvest"],
  livestock: ["livestock", "animals", "cattle", "livestock_production"],
  fertilizer: ["fertilizer", "fertiliser", "plant_nutrient"],
  seeds: ["seeds", "planting_material", "improved_seeds"],
  
  // Trade and exports
  exports: ["exports", "export_value", "foreign_sales"],
  imports: ["imports", "import_value", "foreign_purchases"],
  trade_balance: ["trade_balance", "net_exports", "trade_surplus_deficit"],
  
  // Infrastructure
  infrastructure: ["infrastructure", "facilities", "amenities"],
  electricity: ["electricity", "power", "electrification"],
  water: ["water", "water_access", "clean_water"],
  roads: ["roads", "road_network", "transport_infrastructure"],
  
  // Units and measurements
  percentage: ["percentage", "percent", "pct", "%", "rate", "proportion"],
  quantity: ["quantity", "qty", "amount", "number", "count", "total"],
  value: ["value", "val", "worth", "amount_usd", "monetary_value"],
  area: ["area", "size", "hectares", "acres", "square_km"],
  
  // Common modifiers
  total: ["total", "sum", "all", "overall", "aggregate"],
  average: ["average", "avg", "mean"],
  median: ["median", "med"],
  growth: ["growth", "increase", "change", "delta"],
  rate: ["rate", "ratio", "percentage", "proportion"],
  
  // Special categories
  urban: ["urban", "city", "municipal", "town"],
  rural: ["rural", "countryside", "village", "non_urban"],
  
  // Rwanda-specific terms
  umudugudu: ["umudugudu", "village", "community"],
  akarere: ["akarere", "district"],
  intara: ["intara", "province"],
  umurenge: ["umurenge", "sector"],
  akagali: ["akagali", "cell"]
};

// Field type detection for data validation and transformation
const fieldTypes = {
  numeric: [
    'population', 'gdp', 'gdp_growth', 'gdp_per_capita', 'inflation', 
    'unemployment', 'poverty', 'poverty_gap', 'inequality', 'literacy',
    'primary', 'secondary', 'tertiary', 'no_education', 'life_expectancy',
    'mortality', 'malnutrition', 'exports', 'imports', 'trade_balance',
    'electricity', 'water', 'roads', 'percentage', 'quantity', 'value',
    'area', 'total', 'average', 'median', 'growth', 'rate', 'male', 'female',
    'children', 'youth', 'adults', 'elderly', 'crops', 'livestock', 'fertilizer', 'seeds'
  ],
  geographic: ['country', 'province', 'district', 'sector', 'cell', 'urban', 'rural'],
  temporal: ['year', 'month', 'quarter', 'date'],
  categorical: ['name', 'sex', 'id']
};

// Data cleaning and normalization functions
const dataCleaners = {
  numeric: (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    
    // Remove common non-numeric characters but keep decimal points and negatives
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? null : num;
  },
  
  percentage: (value) => {
    const num = dataCleaners.numeric(value);
    if (num === null) return null;
    
    // Convert to decimal if it appears to be a percentage (e.g., 85.5 -> 0.855)
    if (num > 1 && num <= 100) {
      return num / 100;
    }
    return num;
  },
  
  string: (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  },
  
  year: (value) => {
    const num = dataCleaners.numeric(value);
    if (num === null) return null;
    
    // Handle 2-digit years
    if (num < 100) {
      return num < 50 ? 2000 + num : 1900 + num;
    }
    
    // Validate reasonable year range
    return (num >= 1900 && num <= 2100) ? Math.floor(num) : null;
  },
  
  boolean: (value) => {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    return ['yes', 'true', '1', 'y'].includes(str);
  }
};

/**
 * Enhanced canonical key finder with fuzzy matching and confidence scoring
 */
function findCanonicalKey(header, enableFuzzy = true) {
  if (!header || typeof header !== 'string') return header;
  
  const h = header.toLowerCase().replace(/[_\s-]+/g, "");
  if (!h) return header;
  
  // Exact match first
  for (const [canon, variants] of Object.entries(canonicalMap)) {
    if (variants.some(v => h === v.replace(/[_\s-]+/g, ""))) {
      return { canonical: canon, confidence: 1.0, original: header };
    }
  }
  
  // Fuzzy matching if enabled
  if (enableFuzzy) {
    let bestMatch = null;
    let bestScore = 0.7; // Minimum confidence threshold
    
    for (const [canon, variants] of Object.entries(canonicalMap)) {
      for (const variant of variants) {
        const v = variant.replace(/[_\s-]+/g, "");
        const similarity = calculateSimilarity(h, v);
        
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = canon;
        }
      }
    }
    
    if (bestMatch) {
      return { canonical: bestMatch, confidence: bestScore, original: header };
    }
  }
  
  return { canonical: header, confidence: 0.0, original: header };
}

/**
 * Calculate similarity between two strings (Jaccard similarity)
 */
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1);
  const set2 = new Set(str2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Detect field type for proper data cleaning
 */
function detectFieldType(canonicalKey, value) {
  // Check if we have a known type for this canonical key
  for (const [type, keys] of Object.entries(fieldTypes)) {
    if (keys.includes(canonicalKey)) {
      return type;
    }
  }
  
  // Infer type from value samples
  if (Array.isArray(value)) {
    value = value[0]; // Use first element for type detection
  }
  
  if (typeof value === 'number') return 'numeric';
  if (!isNaN(Number(value)) && value !== '') return 'numeric';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  
  // Check for percentage patterns
  if (typeof value === 'string' && (value.includes('%') || /^\d*\.?\d+%$/.test(value))) {
    return 'percentage';
  }
  
  // Check for year patterns
  if (typeof value === 'string' && /^(19|20)\d{2}$/.test(value)) {
    return 'year';
  }
  
  return 'string';
}

/**
 * Clean and normalize a value based on its detected type
 */
function cleanValue(value, fieldType) {
  const cleaner = dataCleaners[fieldType] || dataCleaners.string;
  return cleaner(value);
}

/**
 * Enhanced ontology mapping with data cleaning and validation
 */
export function mapOntology(rows = [], options = {}) {
  const {
    enableFuzzyMatching = true,
    cleanData = true,
    validateData = true,
    addMetadata = true,
    strictMode = false
  } = options;
  
  if (!Array.isArray(rows)) {
    throw new Error('Input must be an array of rows');
  }
  
  const mappedRows = [];
  const mappingReport = {
    totalRows: rows.length,
    mappedFields: new Set(),
    unmappedFields: new Set(),
    dataQuality: {
      cleanValues: 0,
      nullValues: 0,
      transformedValues: 0
    },
    confidenceScores: []
  };
  
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    if (!row || typeof row !== 'object') continue;
    
    const mapped = {};
    const fieldMapping = {};
    
    // Map each field in the row
    for (const [originalKey, originalValue] of Object.entries(row)) {
      const mappingResult = findCanonicalKey(originalKey, enableFuzzyMatching);
      const canonicalKey = mappingResult.canonical;
      
      // Track mapping statistics
      if (mappingResult.confidence > 0.8) {
        mappingReport.mappedFields.add(canonicalKey);
      } else {
        mappingReport.unmappedFields.add(originalKey);
      }
      
      mappingReport.confidenceScores.push(mappingResult.confidence);
      
      // Handle field name conflicts
      if (mapped.hasOwnProperty(canonicalKey)) {
        if (strictMode) {
          console.warn(`Field name conflict: ${canonicalKey} from ${originalKey}`);
          continue;
        }
        // In non-strict mode, create a composite field
        const compositeKey = `${canonicalKey}_${originalKey}`;
        mapped[compositeKey] = originalValue;
        fieldMapping[compositeKey] = originalKey;
      } else {
        mapped[canonicalKey] = originalValue;
        fieldMapping[canonicalKey] = originalKey;
      }
    }
    
    // Clean and validate data if enabled
    if (cleanData) {
      for (const [key, value] of Object.entries(mapped)) {
        const fieldType = detectFieldType(key, value);
        const cleanedValue = cleanValue(value, fieldType);
        
        if (cleanedValue !== value) {
          mappingReport.dataQuality.transformedValues++;
        }
        
        if (cleanedValue === null || cleanedValue === '') {
          mappingReport.dataQuality.nullValues++;
        } else {
          mappingReport.dataQuality.cleanValues++;
        }
        
        mapped[key] = cleanedValue;
      }
    }
    
    // Add metadata
    if (addMetadata) {
      mapped._docId = mapped.id || `doc_${Date.now()}_${idx}`;
      mapped._source = 'ontology_mapped';
      mapped._mapping = fieldMapping;
      mapped._timestamp = new Date().toISOString();
      
      if (validateData) {
        mapped._validation = validateRow(mapped);
      }
    }
    
    mappedRows.push(mapped);
  }
  
  // Generate final report
  mappingReport.averageConfidence = mappingReport.confidenceScores.length > 0 
    ? mappingReport.confidenceScores.reduce((a, b) => a + b, 0) / mappingReport.confidenceScores.length
    : 0;
  
  mappingReport.mappingRate = mappingReport.mappedFields.size / 
    (mappingReport.mappedFields.size + mappingReport.unmappedFields.size) || 0;
  
  mappingReport.dataQuality.cleanRate = mappingReport.dataQuality.cleanValues / 
    (mappingReport.dataQuality.cleanValues + mappingReport.dataQuality.nullValues) || 0;
  
  return {
    rows: mappedRows,
    report: mappingReport,
    ontology: {
      canonicalMap,
      fieldTypes,
      version: '2.0.0'
    }
  };
}

/**
 * Validate a mapped row for data quality
 */
function validateRow(row) {
  const issues = [];
  
  // Check for required fields
  const requiredFields = ['id', 'name', 'year'];
  requiredFields.forEach(field => {
    if (!row[field] && row[field] !== 0) {
      issues.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate numeric ranges
  if (row.percentage !== undefined && row.percentage !== null) {
    if (row.percentage < 0 || row.percentage > 1) {
      issues.push(`Percentage out of range: ${row.percentage}`);
    }
  }
  
  if (row.year !== undefined && row.year !== null) {
    if (row.year < 1900 || row.year > 2100) {
      issues.push(`Invalid year: ${row.year}`);
    }
  }
  
  // Check for data consistency
  if (row.male !== undefined && row.female !== undefined && row.population !== undefined) {
    const calculatedTotal = (row.male || 0) + (row.female || 0);
    const diff = Math.abs(calculatedTotal - (row.population || 0));
    if (diff > calculatedTotal * 0.05) { // 5% tolerance
      issues.push(`Population gender mismatch: calculated ${calculatedTotal}, recorded ${row.population}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    score: Math.max(0, 1 - (issues.length / 10)) // Quality score 0-1
  };
}

/**
 * Export mapping for external use
 */
export function exportMappingSchema() {
  return {
    canonicalMap,
    fieldTypes,
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
}

/**
 * Add custom mappings to the ontology
 */
export function extendOntology(customMappings) {
  if (typeof customMappings !== 'object') {
    throw new Error('Custom mappings must be an object');
  }
  
  for (const [canonical, variants] of Object.entries(customMappings)) {
    if (Array.isArray(variants)) {
      canonicalMap[canonical] = [...new Set([...(canonicalMap[canonical] || []), ...variants])];
    }
  }
  
  return canonicalMap;
}

/**
 * Batch process multiple datasets with consistent mapping
 */
export function batchMapOntology(datasets = [], options = {}) {
  const results = [];
  const globalReport = {
    totalDatasets: datasets.length,
    totalRows: 0,
    overallConfidence: 0,
    combinedFields: new Set()
  };
  
  for (const [index, dataset] of datasets.entries()) {
    try {
      const result = mapOntology(dataset, options);
      results.push({
        datasetIndex: index,
        ...result
      });
      
      globalReport.totalRows += result.rows.length;
      globalReport.overallConfidence += result.report.averageConfidence;
      result.report.mappedFields.forEach(field => globalReport.combinedFields.add(field));
    } catch (error) {
      console.error(`Error processing dataset ${index}:`, error);
      results.push({
        datasetIndex: index,
        error: error.message,
        rows: [],
        report: null
      });
    }
  }
  
  globalReport.overallConfidence /= datasets.length;
  globalReport.fieldCoverage = globalReport.combinedFields.size;
  
  return {
    datasets: results,
    globalReport
  };
}

// Usage examples:
/*
// Basic usage
const result = mapOntology(rawData, {
  enableFuzzyMatching: true,
  cleanData: true,
  validateData: true
});

// Batch processing multiple datasets
const batchResult = batchMapOntology([dataset1, dataset2, dataset3], {
  cleanData: true,
  strictMode: false
});

// Extending ontology with custom terms
extendOntology({
  digital_access: ['internet', 'broadband', 'digital_connectivity'],
  climate_risk: ['climate_vulnerability', 'environmental_risk']
});
*/