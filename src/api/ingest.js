import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { excelToCsv } from "../etl/excelToCsv.js";
import { csvToJson } from "../etl/csvToJson.js";
import { addDocs } from "../search/indexer.js";

const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, name);
  }
});
const upload = multer({ storage });

const router = Router();

/**
 * Dynamically normalize keys (canonicalization) and add metadata
 */
function mapOntology(rows = []) {
  return rows.map((row, idx) => {
    const mapped = {};
    for (const [k, v] of Object.entries(row)) {
      const canonKey = k?.toLowerCase?.().replace(/[_\s-]+/g, "") || k;
      mapped[canonKey] = v;
    }
    // Add unique document ID
    mapped._docId = row.id || `doc_${Date.now()}_${idx}`;
    return mapped;
  });
}

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No file uploaded (use field name 'file')" });

  try {
    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();

    let allJsonData = [];

    if (ext === ".xlsx" || ext === ".xls") {
      // Convert all sheets to CSVs
      const csvPaths = await excelToCsv(filePath);

      // Convert each CSV to JSON and merge
      for (const csv of csvPaths) {
        const jsonData = await csvToJson(csv);
        allJsonData = allJsonData.concat(jsonData);
      }
    } else if (ext === ".csv") {
      allJsonData = await csvToJson(filePath);
    } else if (ext === ".json") {
      const raw = await fs.readFile(filePath, "utf8");
      allJsonData = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [JSON.parse(raw)];
    } else {
      return res
        .status(400)
        .json({ error: "Unsupported file type. Use .xlsx/.xls/.csv/.json" });
    }

    // Normalize keys and add unique IDs
    const mapped = mapOntology(allJsonData);

    // Index the documents
    await addDocs(mapped);

    res.json({ success: true, count: mapped.length, sample: mapped.slice(0, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
