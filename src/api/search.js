import { Router } from "express";
import { search } from "../search/indexer.js";

const router = Router();

/**
 * Query param: q (string)
 * optional: limit
 */
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  const limit = parseInt(req.query.limit || "20", 10);
  try {
    const result = await search(q, limit);
    console.log('data',JSON.stringify(result))
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
