import fs from "fs";
import csvParser from "csv-parser";

/**
 * Read a CSV and return an array of JSON objects (rows).
 */
export function csvToJson(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (data) => {
        // trim keys and values
        const cleaned = {};
        for (const k of Object.keys(data)) {
          const key = k?.trim();
          const val = data[k] === undefined ? null : ("" + data[k]).trim();
          cleaned[key] = val;
        }
        results.push(cleaned);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}
