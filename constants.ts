import { MP } from './types';

// Fallback FC lists for Seller logic
export const FALLBACK_FCS: Record<string, string[]> = {
  [MP.AMAZON]: ['BLR8', 'HYD3', 'BOM5', 'CJB1', 'DEL5'],
  [MP.FLIPKART]: ['MALUR', 'KOLKATA', 'SANPKA', 'HYDERABAD', 'BHIWANDI'],
  [MP.MYNTRA]: ['Bangalore', 'Mumbai', 'Bilaspur'],
};

// Live Google Sheets CSV Publish Links
// Base ID: 2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm
export const DEFAULT_SHEET_URLS = {
  sales30d: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=1268196089&single=true&output=csv',
  fcStock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=2046154602&single=true&output=csv',
  uniwareStock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=535319358&single=true&output=csv',
  remarks: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRarC7jnt04o-cSMEJN-h3nrbNyhgd-JCoxy6B0oDwwlX09SLQjB4kMJIOkeLRXy9RId28iJjbTd8Tm/pub?gid=998019043&single=true&output=csv'
};

export const UNIWARE_ALLOCATION_CAP = 0.40;
export const TARGET_STOCK_COVER = 45;
export const MAX_STOCK_COVER = 60;
