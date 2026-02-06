import { MP } from './types';

// Fallback FC lists for Seller logic
export const FALLBACK_FCS: Record<string, string[]> = {
  [MP.AMAZON]: ['BLR8', 'HYD3', 'BOM5', 'CJB1', 'DEL5'],
  [MP.FLIPKART]: ['MALUR', 'KOLKATA', 'SANPKA', 'HYDERABAD', 'BHIWANDI'],
  [MP.MYNTRA]: ['Bangalore', 'Mumbai', 'Bilaspur'],
};

// Placeholder URLs for demo purposes
export const DEFAULT_SHEET_URLS = {
  sales30d: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1.../pub?output=csv',
  fcStock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2.../pub?output=csv',
  uniwareStock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3.../pub?output=csv',
  remarks: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4.../pub?output=csv'
};

export const UNIWARE_ALLOCATION_CAP = 0.40;
export const TARGET_STOCK_COVER = 45;
export const MAX_STOCK_COVER = 60;
