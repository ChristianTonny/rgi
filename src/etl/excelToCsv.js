import XLSX from "xlsx";
import path from "path";
import fs from "fs/promises";

/**
 * Convert all worksheets of an Excel file to separate CSV files.
 * Returns an array of CSV file paths.
 */
export async function excelToCsv(excelPath) {
  const workbook = XLSX.readFile(excelPath);
  const csvPaths = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Create CSV file name based on Excel file + sheet name
    const csvFileName = `${path.basename(excelPath, path.extname(excelPath))}_${sheetName}.csv`;
    const csvPath = path.join(path.dirname(excelPath), csvFileName);

    await fs.writeFile(csvPath, csv, "utf8");
    csvPaths.push(csvPath);
  }

  return csvPaths;
}

// Default export (optional, so you can import either way)
export default excelToCsv;
