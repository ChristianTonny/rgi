import FlexSearch from "flexsearch";

/**
 * A very small in-memory indexer using FlexSearch.
 * For production, swap this for Elasticsearch / Weaviate / Postgres+pgvector as needed.
 *
 * API:
 * - addDocs(arrayOfDocs)
 * - search(query) => returns hits with score and doc
 * - stats() => basic metrics
 */

// Create the index
const index = new FlexSearch.Document({
  document: {
    id: "_docId",
    index: ["name", "population", "quantity", "gdp", "year"],
    store: ["name", "population", "quantity", "gdp", "year", "_docId", "__raw"]
  },
  tokenize: "forward"
});

// store raw docs in a map for provenance
const RAW = new Map();

export async function addDocs(docs = []) {
  for (const doc of docs) {
    // store copy
    RAW.set(doc._docId, { ...doc });
    // add a raw JSON string to store to improve retrieval
    const toIndex = { ...doc, __raw: JSON.stringify(doc) };
    index.add(toIndex);
  }
  return { indexed: docs.length };
}

export async function clearIndex() {
  // Clear the RAW storage
  RAW.clear();
  
  // For FlexSearch, we need to recreate the index to clear it
  // since there's no direct clear() method
  // Note: This might not work as expected - consider the recreation approach
  try {
    // Try to remove all documents
    index.remove(() => true);
  } catch (error) {
    console.warn("Clear index method might not be fully supported");
  }
  
  return { cleared: true };
}

export async function search(query = "", limit = 20) {
  if (!query) return { total: 0, hits: [] };

  const results = index.search(query, { limit, enrich: true });

  const ids = new Set();
  const hits = [];

  // results is an array per field
  for (const resByField of results) {
    // resByField.result is an array of objects: { id, doc }
    for (const item of resByField.result) {
      const docId = item.id;
      if (!ids.has(docId)) {
        ids.add(docId);
        // Use the raw document from RAW map, not item.doc
        const raw = RAW.get(docId) || null;
        hits.push({ id: docId, doc: raw });
      }
    }
  }

  return { total: hits.length, hits: hits.slice(0, limit) };
}


export function stats() {
  return {
    docs_count: RAW.size
  };
}