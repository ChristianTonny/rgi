import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { excelToCsv } from "../etl/excelToCsv.js";
import { csvToJson } from "../etl/csvToJson.js";
import { mapOntology } from "../etl/ontologyMapper.js";
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
 * Accepts an uploaded Excel or CSV file (form field name: "file").
 * Returns mapped JSON and indexes the docs in-memory.
 */
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded (use field name 'file')" });

  try {
    let filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();

    let csvPath = filePath;
    if (ext === ".xlsx" || ext === ".xls") {
      csvPath = await excelToCsv(filePath);
    } else if (ext === ".csv") {
      // already csv
    } else if (ext === ".json") {
      // if user uploaded json, just parse below via csvToJson will not apply; handle simply
      const raw = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(raw);
      const mapped = mapOntology(Array.isArray(data) ? data : [data]);
      await addDocs(mapped);
      return res.json({ success: true, count: mapped.length, sample: mapped.slice(0, 5) });
    } else {
      return res.status(400).json({ error: "Unsupported file type. Use .xlsx/.xls/.csv/.json" });
    }

    const jsonData = await csvToJson(csvPath);
    const mapped = mapOntology(jsonData);

    // index the docs
    await addDocs(mapped);

    res.json({ success: true, count: mapped.length, sample: mapped.slice(0, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
