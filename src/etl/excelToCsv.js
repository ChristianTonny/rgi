import XLSX from "xlsx";
import path from "path";
import fs from "fs/promises";

/**
 * Convert the first worksheet of an Excel file to a CSV file.
 * Returns the CSV path.
 */
export async function excelToCsv(excelPath) {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const csvPath = excelPath.replace(/\.[^/.]+$/, "") + ".csv";
  await fs.writeFile(csvPath, csv, "utf8");
  return csvPath;
}
