import fs from "fs";
import csvParser from "csv-parser";

/**
 * Normalize column names to safe JSON keys
 */
function normalizeKey(col) {
  return col
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Parse agriculture CSV with structure:
 * Line 1: Appendix description
 * Line 2: Column headers
 * Line 3+: Data rows
 */
export async function parseAgricultureCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(filePath, "utf8");
    const lines = data.split("\n");
    
    // Extract appendix name from first line
    const firstLine = lines[0] || "";
    let appendixName = firstLine
      .split(",")
      .find(cell => {
        const cleaned = cell.trim().toLowerCase();
        return cleaned && 
               !cleaned.includes("list of appendix") && 
               !cleaned.includes("list of tables");
      }) || "Unknown Appendix";
    appendixName = appendixName.replace(/"/g, "").trim();
    
    // Extract headers from second line
    const headerLine = lines[1] || "";
    const headers = headerLine.split(",").map(h => h.trim().replace(/"/g, ""));
    const normalizedHeaders = headers.map(h => normalizeKey(h));
    
    // Identify key column (first column, usually District/Category)
    const keyColumn = normalizedHeaders[0] || "key";
    
    // Parse data starting from line 3 (index 2)
    const rows = [];
    const insights = []; // Flattened data for RediSearch indexing
    
    fs.createReadStream(filePath)
      .pipe(csvParser({ skipLines: 2, headers: normalizedHeaders }))
      .on("data", (row) => {
        // Clean up the row data
        const cleanedRow = {};
        const keyValue = row[keyColumn] ? String(row[keyColumn]).trim() : "";
        
        Object.keys(row).forEach(key => {
          const value = row[key] ? String(row[key]).trim() : "";
          
          // Convert numeric values
          if (value && !isNaN(parseFloat(value))) {
            cleanedRow[key] = parseFloat(value);
          } else if (value === "-" || value === "") {
            cleanedRow[key] = null;
          } else {
            cleanedRow[key] = value;
          }
          
          // Create insights for each data point (for RediSearch)
          if (key !== keyColumn && cleanedRow[key] !== null) {
            insights.push({
              appendix: appendixName,
              parent: keyColumn,
              field: key,
              key_value: keyValue,
              value: cleanedRow[key]
            });
          }
        });
        
        // Only add rows that have meaningful data
        const hasData = Object.values(cleanedRow).some(v => v !== null && v !== "");
        if (hasData && keyValue) {
          rows.push(cleanedRow);
        }
      })
      .on("end", () => {
        const result = {
          appendixName: appendixName,
          source: appendixName,
          headers: headers.filter(h => h).map((header, index) => ({
            name: header,
            normalized: normalizedHeaders[index]
          })),
          insights: insights, // For RediSearch indexing
          data: rows // For structured API response
        };
        
        console.log(`Parsed ${rows.length} rows, ${insights.length} insights from ${appendixName}`);
        resolve(result);
      })
      .on("error", reject);
  });
}

// Example usage:
// const result = await parseAgricultureCSV("your-file.csv");
// Result format:
// {
//   "appendixName": "Percentage of agricultural households' population by sex and district",
//   "source": "Percentage of agricultural households' population by sex and district",
//   "headers": [
//     { "name": "District", "normalized": "district" },
//     { "name": "Male (%)", "normalized": "male" }
//   ],
//   "insights": [
//     { "appendix": "...", "parent": "district", "field": "male", "key_value": "Nyarugenge", "value": 47.7 },
//     { "appendix": "...", "parent": "district", "field": "female", "key_value": "Nyarugenge", "value": 52.3 }
//   ],
//   "data": [
//     { "district": "Nyarugenge", "male": 47.7, "female": 52.3, "total": 100 }
//   ]
// }