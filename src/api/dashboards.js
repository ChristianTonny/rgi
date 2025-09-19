import { Router } from "express";
import { stats } from "../search/indexer.js";

const router = Router();

/**
 * Simple dashboard endpoints.
 * - GET /api/dashboards/summary
 */
router.get("/summary", async (req, res) => {
  try {
    const s = stats();
    res.json({
      success: true,
      data: {
        docs_count: s.docs_count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
