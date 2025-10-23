const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelParser {
  /**
   * Parse Excel file and extract data
   * @param {string} filePath - Path to the Excel file
   * @returns {Object} Parsed data with headers, rows, and metadata
   */
  static parseExcelFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get sheet names
      const sheetNames = workbook.SheetNames;
      
      if (sheetNames.length === 0) {
        throw new Error('No sheets found in the Excel file');
      }

      // Use the first sheet by default
      const activeSheetName = sheetNames[0];
      const worksheet = workbook.Sheets[activeSheetName];
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        raw: false
      });
      
      if (jsonData.length === 0) {
        throw new Error('The Excel sheet is empty');
      }

      // Extract headers (first row)
      const headers = jsonData[0] || [];
      
      // Filter out empty headers and create clean header names
      const cleanHeaders = headers.map((header, index) => {
        if (header === null || header === undefined || header === '') {
          return `Column_${index + 1}`;
        }
        return String(header).trim();
      });

      // Extract data rows (excluding header)
      const dataRows = jsonData.slice(1);
      
      // Process rows and convert to objects
      const processedRows = dataRows
        .filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, rowIndex) => {
          const rowObject = {};
          cleanHeaders.forEach((header, colIndex) => {
            let cellValue = row[colIndex];
            
            // Handle different data types
            if (cellValue !== null && cellValue !== undefined) {
              // Try to detect and parse numbers
              if (typeof cellValue === 'string' && !isNaN(cellValue) && cellValue.trim() !== '') {
                const numValue = parseFloat(cellValue);
                if (!isNaN(numValue)) {
                  cellValue = numValue;
                }
              }
              
              // Try to detect dates
              if (typeof cellValue === 'string' && this.isDateString(cellValue)) {
                cellValue = new Date(cellValue);
              }
            }
            
            rowObject[header] = cellValue;
          });
          
          rowObject._rowIndex = rowIndex + 2; // +2 because we start from row 2 (after header)
          return rowObject;
        });

      // Analyze data types for each column
      const columnAnalysis = this.analyzeColumns(cleanHeaders, processedRows);

      // Generate metadata
      const metadata = {
        sheetNames: sheetNames,
        activeSheet: activeSheetName,
        totalSheets: sheetNames.length,
        fileSize: fs.statSync(filePath).size,
        columnAnalysis: columnAnalysis
      };

      return {
        headers: cleanHeaders,
        rows: processedRows,
        totalRows: processedRows.length,
        totalColumns: cleanHeaders.length,
        metadata: metadata,
        success: true
      };

    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Parse specific sheet from Excel file
   * @param {string} filePath - Path to the Excel file
   * @param {string} sheetName - Name of the sheet to parse
   * @returns {Object} Parsed data for specific sheet
   */
  static parseSpecificSheet(filePath, sheetName) {
    try {
      const workbook = XLSX.readFile(filePath);
      
      if (!workbook.Sheets[sheetName]) {
        throw new Error(`Sheet '${sheetName}' not found`);
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        raw: false
      });

      if (jsonData.length === 0) {
        throw new Error(`Sheet '${sheetName}' is empty`);
      }

      const headers = jsonData[0] || [];
      const cleanHeaders = headers.map((header, index) => {
        if (header === null || header === undefined || header === '') {
          return `Column_${index + 1}`;
        }
        return String(header).trim();
      });

      const dataRows = jsonData.slice(1);
      const processedRows = dataRows
        .filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, rowIndex) => {
          const rowObject = {};
          cleanHeaders.forEach((header, colIndex) => {
            let cellValue = row[colIndex];
            
            if (cellValue !== null && cellValue !== undefined) {
              if (typeof cellValue === 'string' && !isNaN(cellValue) && cellValue.trim() !== '') {
                const numValue = parseFloat(cellValue);
                if (!isNaN(numValue)) {
                  cellValue = numValue;
                }
              }
              
              if (typeof cellValue === 'string' && this.isDateString(cellValue)) {
                cellValue = new Date(cellValue);
              }
            }
            
            rowObject[header] = cellValue;
          });
          
          rowObject._rowIndex = rowIndex + 2;
          return rowObject;
        });

      return {
        headers: cleanHeaders,
        rows: processedRows,
        totalRows: processedRows.length,
        totalColumns: cleanHeaders.length,
        sheetName: sheetName,
        success: true
      };

    } catch (error) {
      console.error('Sheet parsing error:', error);
      throw new Error(`Failed to parse sheet '${sheetName}': ${error.message}`);
    }
  }

  /**
   * Analyze columns to determine data types and statistics
   * @param {Array} headers - Column headers
   * @param {Array} rows - Data rows
   * @returns {Object} Column analysis results
   */
  static analyzeColumns(headers, rows) {
    const analysis = {};
    
    headers.forEach(header => {
      const values = rows.map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');
      
      const types = {
        string: 0,
        number: 0,
        date: 0,
        boolean: 0,
        null: 0
      };

      let min = null;
      let max = null;
      let sum = 0;
      const uniqueValues = new Set();

      values.forEach(value => {
        uniqueValues.add(value);
        
        if (typeof value === 'number') {
          types.number++;
          sum += value;
          if (min === null || value < min) min = value;
          if (max === null || value > max) max = value;
        } else if (value instanceof Date) {
          types.date++;
        } else if (typeof value === 'boolean') {
          types.boolean++;
        } else if (typeof value === 'string') {
          types.string++;
        } else {
          types.null++;
        }
      });

      // Determine primary data type
      const typeEntries = Object.entries(types);
      const primaryType = typeEntries.reduce((a, b) => types[a[0]] > types[b[0]] ? a : b)[0];

      analysis[header] = {
        dataType: primaryType,
        totalValues: values.length,
        uniqueValues: uniqueValues.size,
        nullCount: rows.length - values.length,
        typeDistribution: types,
        isNumeric: types.number > types.string && types.number > 0,
        isDate: types.date > 0,
        statistics: types.number > 0 ? {
          min: min,
          max: max,
          average: values.length > 0 ? sum / types.number : 0,
          sum: sum
        } : null,
        sampleValues: Array.from(uniqueValues).slice(0, 5) // First 5 unique values
      };
    });

    return analysis;
  }

  /**
   * Check if a string represents a date
   * @param {string} str - String to check
   * @returns {boolean} True if string is a date
   */
  static isDateString(str) {
    if (typeof str !== 'string') return false;
    
    // Common date patterns
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // MM/DD/YYYY or M/D/YYYY
      /^\d{4}-\d{1,2}-\d{1,2}$/,       // YYYY-MM-DD or YYYY-M-D
      /^\d{1,2}-\d{1,2}-\d{4}$/,       // MM-DD-YYYY or M-D-YYYY
      /^\d{1,2}\.\d{1,2}\.\d{4}$/,     // MM.DD.YYYY or M.D.YYYY
    ];

    return datePatterns.some(pattern => pattern.test(str)) && !isNaN(Date.parse(str));
  }

  /**
   * Get basic file information
   * @param {string} filePath - Path to the Excel file
   * @returns {Object} File information
   */
  static getFileInfo(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const stats = fs.statSync(filePath);
      
      return {
        fileName: path.basename(filePath),
        fileSize: stats.size,
        sheetNames: workbook.SheetNames,
        totalSheets: workbook.SheetNames.length,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Validate Excel file before processing
   * @param {string} filePath - Path to the Excel file
   * @returns {Object} Validation result
   */
  static validateExcelFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { isValid: false, error: 'File not found' };
      }

      const stats = fs.statSync(filePath);
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (stats.size > maxSize) {
        return { isValid: false, error: 'File size exceeds 10MB limit' };
      }

      const workbook = XLSX.readFile(filePath);
      
      if (workbook.SheetNames.length === 0) {
        return { isValid: false, error: 'No sheets found in Excel file' };
      }

      return { isValid: true, sheetCount: workbook.SheetNames.length };

    } catch (error) {
      return { isValid: false, error: `Invalid Excel file: ${error.message}` };
    }
  }
}

module.exports = ExcelParser;