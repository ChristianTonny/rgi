/**
 * Simple ontology mapper.
 * Provide a mapping from common input column names to canonical keys.
 *
 * Example:
 *  - "pop", "population", "population_total" => "population"
 *  - "qty", "quantity" => "quantity"
 *
 * This is intentionally simple — extend to fit your domain.
 */

const canonicalMap = {
  population: ["pop", "population", "population_total", "total_population"],
  quantity: ["qty", "quantity", "amount"],
  name: ["name", "entity", "country", "region"],
  year: ["year", "yr"],
  gdp: ["gdp", "gdp_usd", "gdp_us"],
  id: ["id", "uid", "identifier"]
};

function findCanonicalKey(header) {
  const h = header?.toLowerCase?.().replace(/[_\s-]+/g, "");
  if (!h) return header;
  for (const [canon, variants] of Object.entries(canonicalMap)) {
    if (variants.some(v => h === v.replace(/[_\s-]+/g, ""))) return canon;
  }
  return header;
}

export function mapOntology(rows = []) {
  return rows.map((row, idx) => {
    const mapped = {};
    for (const [k, v] of Object.entries(row)) {
      const key = findCanonicalKey(k);
      mapped[key] = v;
    }
    // add metadata
    mapped._docId = mapped.id || `doc_${Date.now()}_${idx}`;
    return mapped;
  });
}
