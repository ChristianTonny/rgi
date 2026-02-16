import fs from 'fs'; // Regular fs for streams
import { Readable } from 'stream';
import csv from 'csv-parser';

/**
 * Enhanced CSV to JSON converter that handles multi-row headers
 */
export async function csvToJson(csvPath, options = {}) {
  const {
    headerRow = 0, // Which row to use as headers (0-indexed)
    skipRows = 0,  // How many rows to skip before header row
  } = options;

  return new Promise((resolve, reject) => {
    const results = [];
    let currentRow = 0;
    let headers = [];

    const stream = fs.createReadStream(csvPath)
      .pipe(csv({
        headers: false, // We'll handle headers manually
        skipEmptyLines: true,
        trim: true
      }))
      .on('data', (row) => {
        currentRow++;
        
        // Skip initial rows
        if (currentRow <= skipRows) return;
        
        // Find header row
        if (currentRow === headerRow + skipRows + 1) {
          headers = Object.values(row).filter(val => val && val.trim() !== '');
          console.log('Found headers:', headers);
          return;
        }
        
        // Process data rows (after header)
        if (headers.length > 0 && currentRow > headerRow + skipRows + 1) {
          const obj = {};
          const values = Object.values(row);
          
          headers.forEach((header, index) => {
            if (header && header.trim() !== '') {
              const value = values[index] || '';
              obj[header] = value.trim();
            }
          });
          
          // Only add if we have some data
          if (Object.values(obj).some(val => val !== '')) {
            results.push(obj);
          }
        }
      })
      .on('end', () => {
        console.log(`Processed ${results.length} rows from CSV`);
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Auto-detect the best header row for complex CSV files
 */
export async function csvToJsonAuto(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const rows = [];
    let bestHeaderRow = 0;

    const stream = fs.createReadStream(csvPath)
      .pipe(csv({ headers: false, skipEmptyLines: true, trim: true }))
      .on('data', (row) => {
        rows.push(Object.values(row));
      })
      .on('end', () => {
        if (rows.length === 0) {
          resolve([]);
          return;
        }

        // Find the best header row (row with most non-empty cells)
        let maxNonEmpty = 0;
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const nonEmptyCount = rows[i].filter(cell => cell && cell.trim() !== '').length;
          if (nonEmptyCount > maxNonEmpty) {
            maxNonEmpty = nonEmptyCount;
            bestHeaderRow = i;
          }
        }

        console.log(`Auto-detected header row: ${bestHeaderRow + 1}`);
        
        const headers = rows[bestHeaderRow].map(h => h || '').filter(h => h.trim() !== '');
        
        // Process data rows
        for (let i = bestHeaderRow + 1; i < rows.length; i++) {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = (rows[i][index] || '').trim();
          });
          
          if (Object.values(obj).some(val => val !== '')) {
            results.push(obj);
          }
        }
        
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Simple CSV parser for basic files
 */
export async function simpleCsvToJson(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}