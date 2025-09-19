import { Router } from "express";
import { clearIndex, addDocs } from "../search/indexer.js";
import fs from "fs/promises";
import path from "path";
import { csvToJson } from "../etl/csvToJson.js";
import { mapOntology } from "../etl/ontologyMapper.js";

const router = Router();

/**
 * Manage background jobs (very lightweight examples)
 *
 * POST /api/tasks/reindex
 *   - re-index all CSV files in /uploads (simple demo)
 *
 * GET /api/tasks/health
 *   - return tasks status
 */

router.get("/health", (req, res) => {
  res.json({ success: true, tasks: ["reindex"] });
});

router.post("/reindex", async (req, res) => {
  try {
    // clear index
    await clearIndex();

    // naive: look for .csv files in uploads and index them
    const uploadsDir = path.join(process.cwd(), "uploads");
    let files = [];
    try {
      files = await fs.readdir(uploadsDir);
    } catch {
      files = [];
    }
    const csvFiles = files.filter(f => f.toLowerCase().endsWith(".csv")).map(f => path.join(uploadsDir, f));
    let totalIndexed = 0;
    for (const csvPath of csvFiles) {
      const rows = await csvToJson(csvPath);
      const mapped = mapOntology(rows);
      await addDocs(mapped);
      totalIndexed += mapped.length;
    }

    res.json({ success: true, indexed: totalIndexed, files: csvFiles.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
