import { RawSaleRow, RawFCStockRow, RawUniwareStockRow, RawRemarkRow } from '../types';

// Simple CSV parser
const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  return lines.map(line => {
    // Handle quotes if necessary, but simple split for now assuming clean data or standard CSV
    // A robust regex for CSV parsing:
    const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 
    return line.split(re).map(cell => cell.replace(/^"|"$/g, '').trim());
  });
};

// Mock data generator for demonstration since we don't have real live URLs
// In a real app, we would fetch(url).then(res => res.text()).then(parseCSV)
export const fetchAndNormalizeData = async (): Promise<{
  sales: RawSaleRow[];
  fcStock: RawFCStockRow[];
  uniwareStock: RawUniwareStockRow[];
  remarks: RawRemarkRow[];
}> => {
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // --- MOCK DATA ---
  
  const sales: RawSaleRow[] = [
    // Amazon Valid Sales
    { mp: 'Amazon IN', date: '2023-10-01', sku: 'SKU_A_1', channelId: 'CH_1', quantity: 50, warehouseId: 'BLR8', fulfillmentType: 'FBA', uniwareSku: 'UNI_A', styleId: 'STYLE_A', size: 'M' },
    { mp: 'Amazon IN', date: '2023-10-02', sku: 'SKU_A_1', channelId: 'CH_1', quantity: 40, warehouseId: 'BLR8', fulfillmentType: 'FBA', uniwareSku: 'UNI_A', styleId: 'STYLE_A', size: 'M' },
    // Flipkart Valid Sales
    { mp: 'Flipkart', date: '2023-10-01', sku: 'SKU_B_1', channelId: 'CH_2', quantity: 30, warehouseId: 'MALUR', fulfillmentType: 'FA', uniwareSku: 'UNI_B', styleId: 'STYLE_B', size: 'L' },
    // Seller Sales (Warehouse ID 'SELF_WH' not in FC Stock list)
    { mp: 'Amazon IN', date: '2023-10-05', sku: 'SKU_A_1', channelId: 'CH_1', quantity: 150, warehouseId: 'SELF_WH', fulfillmentType: 'Merchant', uniwareSku: 'UNI_A', styleId: 'STYLE_A', size: 'M' },
    // Closed Style Sales
    { mp: 'Myntra', date: '2023-10-01', sku: 'SKU_C_1', channelId: 'CH_3', quantity: 20, warehouseId: 'Bangalore', fulfillmentType: 'JIT', uniwareSku: 'UNI_C', styleId: 'STYLE_C', size: 'S' },
  ];

  const fcStock: RawFCStockRow[] = [
    { mp: 'Amazon IN', warehouseId: 'BLR8', sku: 'SKU_A_1', channelId: 'CH_1', quantity: 10 }, // Low stock, should ship
    { mp: 'Flipkart', warehouseId: 'MALUR', sku: 'SKU_B_1', channelId: 'CH_2', quantity: 500 }, // High stock, should recall
    { mp: 'Myntra', warehouseId: 'Bangalore', sku: 'SKU_C_1', channelId: 'CH_3', quantity: 50 },
  ];

  const uniwareStock: RawUniwareStockRow[] = [
    { uniwareSku: 'UNI_A', quantity: 1000 },
    { uniwareSku: 'UNI_B', quantity: 200 },
    { uniwareSku: 'UNI_C', quantity: 500 },
  ];

  const remarks: RawRemarkRow[] = [
    { styleId: 'STYLE_C', category: 'DRESS', companyRemark: 'Closed' }, // Should trigger recall for C
    { styleId: 'STYLE_A', category: 'TOP', companyRemark: 'Active' },
    { styleId: 'STYLE_B', category: 'TOP', companyRemark: 'Active' },
  ];

  return { sales, fcStock, uniwareStock, remarks };
};
