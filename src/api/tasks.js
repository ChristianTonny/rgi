import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { parseAgricultureCSV } from "../etl/parseAgricultureCSV.js";
import { addDocs, clearIndex, debugIndex } from "../search/indexer.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, tasks: ["reindex"] });
});
// POST route - for indexing insights into RediSearch
router.post("/reindex", async (req, res) => {
  try {
    await clearIndex();

    const uploadsDir = path.join(process.cwd(), "uploads");
    let files = [];
    try { files = await fs.readdir(uploadsDir); } catch { files = []; }

    const csvFiles = files.filter(f => f.toLowerCase().endsWith(".csv"));

    let totalIndexed = 0, filesProcessed = 0;

    for (const csvFile of csvFiles) {
      const csvPath = path.join(uploadsDir, csvFile);
      
      // Parser returns an object now, not an array
      const parsed = await parseAgricultureCSV(csvPath);
      
      // Check if we have insights to index
      if (!parsed || !parsed.insights || !parsed.insights.length) continue;

      const result = await addDocs(parsed.insights); // Use insights, not the whole object
      totalIndexed += result.indexed;
      filesProcessed++;
    }

    const debugInfo = debugIndex();
    res.json({ 
      success: true, 
      indexed: totalIndexed, 
      filesProcessed, 
      totalFiles: csvFiles.length, 
      debug: debugInfo.length 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route - for getting structured data + indexing
router.get("/reindex", async (req, res) => {
  try {
    await clearIndex();

    const uploadsDir = path.join(process.cwd(), "uploads");
    let files = [];
    try {
      files = await fs.readdir(uploadsDir);
    } catch {
      files = [];
    }

    const csvFiles = files.filter(f => f.toLowerCase().endsWith(".csv"));
    let totalIndexed = 0, filesProcessed = 0;
    const allData = [];

    for (const csvFile of csvFiles) {
      const csvPath = path.join(uploadsDir, csvFile);
      const parsed = await parseAgricultureCSV(csvPath);

      if (!parsed || !parsed.insights || !parsed.insights.length) continue;

      // Index flattened insights in RediSearch
      const result = await addDocs(parsed.insights);
      totalIndexed += result.indexed;

      // Collect full structured data
      allData.push({
        appendixName: parsed.appendixName,
        source: parsed.source,
        headers: parsed.headers,
        data: parsed.data
      });

      filesProcessed++;
    }

    const debugInfo = debugIndex();

    res.json({
      success: true,
      indexed: totalIndexed,
      filesProcessed,
      totalFiles: csvFiles.length,
      debug: debugInfo.length,
      structuredData: allData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/all-data", async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    let files = await fs.readdir(uploadsDir);
    const csvFiles = files.filter(f => f.toLowerCase().endsWith(".csv"));
    
    const allData = {};
    
    for (const csvFile of csvFiles) {
      const csvPath = path.join(uploadsDir, csvFile);
      const data = await parseAgricultureCSV(csvPath);
      
      // Use filename or appendix name as key
      const key = csvFile.replace('.csv', '');
      allData[key] = data;
    }
    
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
