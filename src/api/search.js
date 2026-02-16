import { Router } from "express";
import { search } from "../search/indexer.js";

const router = Router();

/**
 * GET /api/search?q=QUERY&limit=20
 * Query params:
 *   - q: string (required)
 *   - limit: number (optional, default 20)
 */
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const limit = parseInt(req.query.limit || "50", 10);

  console.log(`Search requested: query="${q}", limit=${limit}`);

  if (!q) {
    return res.json({ total: 0, hits: [] });
  }

  try {
    const result = await search(q, limit);

    // Map results to include only relevant info, no RAW needed
    const formattedHits = result.hits.map(hit => ({
      id: hit.id,
      doc: hit.doc || {}
    }));

    const response = {
      total: result.total,
      hits: formattedHits
    };

   // console.log("Search results:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
