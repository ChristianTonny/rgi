import FlexSearch from "flexsearch";

let index = null;
const RAW = new Map();

/**
 * Create FlexSearch index dynamically based on fields
 */
function createIndex(fields = []) {
  if (!fields.length) {
    console.warn("No fields available to create FlexSearch index");
    return;
  }

  index = new FlexSearch.Document({
    document: {
      id: "_docId",
      index: fields,
      store: [...fields, "_docId", "__raw"],
    },
    tokenize: "full"
  });
}

/**
 * Normalize documents: prepare for indexing while preserving objects
 */
function normalizeDocs(docs, fields) {
  const normalizedDocs = [];
  
  for (const doc of docs) {
    if (!doc || typeof doc !== "object" || Object.keys(doc).length === 0) continue;

    const normalized = { _docId: doc._docId || `doc_${Date.now()}_${Math.random()}` };

    for (const f of fields) {
      let value = doc[f] ?? "";
      
      // Handle different value types
      if (typeof value === 'object' && value !== null) {
        // Store objects as JSON strings for FlexSearch indexing
        // but keep original in RAW for retrieval
        normalized[f] = JSON.stringify(value);
      } else if (typeof value === 'string') {
        normalized[f] = value.trim().toLowerCase();
      } else {
        normalized[f] = String(value).trim().toLowerCase();
      }
    }

    normalizedDocs.push(normalized);
  }

  return normalizedDocs;
}

/**
 * Extract all unique fields from documents
 */
function getAllFields(docs) {
  const fieldSet = new Set();

  for (const doc of docs) {
    if (doc && typeof doc === "object") {
      Object.keys(doc)
        .filter(k => k !== "_docId" && k !== "__raw")
        .forEach(k => fieldSet.add(k));
    }
  }

  return Array.from(fieldSet);
}

/**
 * Add documents to index safely
 */
export async function addDocs(docs = []) {
  if (!docs.length) return { indexed: 0 };

  const validDocs = docs.filter(doc => doc && typeof doc === "object" && Object.keys(doc).length > 0);
  if (!validDocs.length) return { indexed: 0 };

  const fields = getAllFields(validDocs);
  if (!fields.length) return { indexed: 0 };

  if (!index) createIndex(fields);

  const normalizedDocs = normalizeDocs(validDocs, fields);

  try {
    for (let i = 0; i < validDocs.length; i++) {
      const original = validDocs[i];
      const normalized = normalizedDocs[i];
      
      // Store ORIGINAL document in RAW (preserves objects)
      RAW.set(normalized._docId, original);
      
      // Add normalized version to FlexSearch index
      index.add({
        ...normalized,
        __raw: JSON.stringify(original)
      });
    }

    return { indexed: normalizedDocs.length };
  } catch (err) {
    console.error("Error adding docs to index:", err);
    throw err;
  }
}

/**
 * Clear the index
 */
export async function clearIndex() {
  RAW.clear();
  index = null;
  return { cleared: true };
}

/**
 * Search index
 */
export async function search(query = "", limit = 20) {
  if (!query || !index) return { total: 0, hits: [] };

  query = String(query).trim().toLowerCase();

  try {
    const results = index.search(query, { limit, enrich: true });
    const hits = [];
    const ids = new Set();

    for (const resByField of results) {
      if (!resByField.result) continue;

      for (const item of resByField.result) {
        if (!ids.has(item.id)) {
          ids.add(item.id);
          hits.push({ id: item.id, doc: RAW.get(item.id) || null });
        }
      }
    }

    return { total: hits.length, hits: hits.slice(0, limit) };
  } catch (err) {
    console.error("Search error:", err);
    return { total: 0, hits: [] };
  }
}

/**
 * Index statistics
 */
export function stats() {
  return { docs_count: RAW.size };
}

/**
 * Debug index
 */
export function debugIndex() {
  const docs = Array.from(RAW.values());
  return {
    totalDocs: docs.length,
    sampleDoc: docs[0] || null,
    allDocIds: Array.from(RAW.keys())
  };
}

export { RAW };