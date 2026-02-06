import { RawSaleRow, RawFCStockRow, RawUniwareStockRow, RawRemarkRow } from '../types';
import { DEFAULT_SHEET_URLS } from '../constants';

// --- CSV Parsing Utilities ---

const fetchText = async (url: string, sheetName: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${sheetName} (Status: ${response.status})`);
    }
    const text = await response.text();
    // Google Sheets sometimes returns HTML error pages for 404/Permission denied even with status 200
    if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
        throw new Error(`Failed to fetch ${sheetName}: The link returned an HTML page instead of CSV. Ensure the sheet is "Published to Web" as CSV.`);
    }
    return text;
  } catch (e: any) {
    throw new Error(`Network Error (${sheetName}): ${e.message}`);
  }
};

const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  // Normalize newlines
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // Skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) {
           rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }
  // Push last row if exists
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
};

// --- Mappers ---

const cleanStr = (val: string | undefined) => val ? val.trim() : '';

const cleanInt = (val: string | undefined) => {
  if (!val) return 0;
  // Remove commas and parse
  const num = parseInt(val.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// Normalize MP names to match App Enums strictly
const normalizeMP = (val: string | undefined) => {
  const s = cleanStr(val);
  const upper = s.toUpperCase();
  if (upper.includes('AMAZON')) return 'Amazon IN';
  if (upper.includes('FLIPKART')) return 'Flipkart';
  if (upper.includes('MYNTRA')) return 'Myntra';
  return s; // Return trimmed original if no match
};

const normalizeHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, '');

const validateColumns = (sheetName: string, headers: string[], required: Record<string, number>) => {
  const missing = Object.entries(required)
    .filter(([key, index]) => index === -1)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    throw new Error(
      `Sheet "${sheetName}" is missing required columns: ${missing.join(', ')}.\n` +
      `Found headers: [${headers.join(', ')}]`
    );
  }
};

const mapSales = (rows: string[][]): RawSaleRow[] => {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  
  const getIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxMap = {
    mp: getIdx(['mp', 'marketplace']),
    date: getIdx(['date']),
    sku: getIdx(['sku']),
    channelId: getIdx(['channelid', 'channel']),
    quantity: getIdx(['quantity', 'qty']),
    warehouseId: getIdx(['warehouseid', 'fc', 'warehouse']),
    fulfillmentType: getIdx(['fulfillmenttype', 'fulfillment']),
    uniwareSku: getIdx(['uniwaresku', 'unisku']),
    styleId: getIdx(['styleid', 'style', 'stylecode']),
    size: getIdx(['size'])
  };

  validateColumns("Sale 30D", rows[0], idxMap);

  return rows.slice(1).map(row => ({
    mp: normalizeMP(row[idxMap.mp]),
    date: cleanStr(row[idxMap.date]),
    sku: cleanStr(row[idxMap.sku]),
    channelId: cleanStr(row[idxMap.channelId]),
    quantity: cleanInt(row[idxMap.quantity]),
    warehouseId: cleanStr(row[idxMap.warehouseId]),
    fulfillmentType: cleanStr(row[idxMap.fulfillmentType]),
    uniwareSku: cleanStr(row[idxMap.uniwareSku]),
    styleId: cleanStr(row[idxMap.styleId]),
    size: cleanStr(row[idxMap.size])
  })).filter(r => r.sku && r.mp); // Basic filtering for valid rows
};

const mapFCStock = (rows: string[][]): RawFCStockRow[] => {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const getIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxMap = {
    mp: getIdx(['mp', 'marketplace']),
    warehouseId: getIdx(['warehouseid', 'fc']),
    sku: getIdx(['sku']),
    channelId: getIdx(['channelid']),
    quantity: getIdx(['quantity', 'qty', 'stock'])
  };

  validateColumns("FC Stock", rows[0], idxMap);

  return rows.slice(1).map(row => ({
    mp: normalizeMP(row[idxMap.mp]),
    warehouseId: cleanStr(row[idxMap.warehouseId]),
    sku: cleanStr(row[idxMap.sku]),
    channelId: cleanStr(row[idxMap.channelId]),
    quantity: cleanInt(row[idxMap.quantity])
  })).filter(r => r.sku && r.warehouseId);
};

const mapUniwareStock = (rows: string[][]): RawUniwareStockRow[] => {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const getIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxMap = {
    uniwareSku: getIdx(['uniwaresku', 'sku']),
    quantity: getIdx(['quantity', 'qty', 'stock'])
  };

  validateColumns("Uniware Stock", rows[0], idxMap);

  return rows.slice(1).map(row => ({
    uniwareSku: cleanStr(row[idxMap.uniwareSku]),
    quantity: cleanInt(row[idxMap.quantity])
  })).filter(r => r.uniwareSku);
};

const mapRemarks = (rows: string[][]): RawRemarkRow[] => {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const getIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxMap = {
    styleId: getIdx(['styleid', 'style', 'stylecode']),
    category: getIdx(['category']),
    companyRemark: getIdx(['companyremark', 'remark', 'status'])
  };
  
  if (idxMap.styleId === -1) {
      throw new Error(`Sheet "Company Remarks" missing "Style ID" column.`);
  }

  return rows.slice(1).map(row => ({
    styleId: cleanStr(row[idxMap.styleId]),
    category: cleanStr(row[idxMap.category]),
    companyRemark: cleanStr(row[idxMap.companyRemark])
  })).filter(r => r.styleId);
};

// --- Main Fetch Function ---

export const fetchAndNormalizeData = async (): Promise<{
  sales: RawSaleRow[];
  fcStock: RawFCStockRow[];
  uniwareStock: RawUniwareStockRow[];
  remarks: RawRemarkRow[];
}> => {
  const [salesCsv, fcStockCsv, uniwareStockCsv, remarksCsv] = await Promise.all([
    fetchText(DEFAULT_SHEET_URLS.sales30d, "Sale 30D"),
    fetchText(DEFAULT_SHEET_URLS.fcStock, "FC Stock"),
    fetchText(DEFAULT_SHEET_URLS.uniwareStock, "Uniware Stock"),
    fetchText(DEFAULT_SHEET_URLS.remarks, "Company Remarks")
  ]);

  const sales = mapSales(parseCSV(salesCsv));
  const fcStock = mapFCStock(parseCSV(fcStockCsv));
  const uniwareStock = mapUniwareStock(parseCSV(uniwareStockCsv));
  const remarks = mapRemarks(parseCSV(remarksCsv));

  return { sales, fcStock, uniwareStock, remarks };
};
