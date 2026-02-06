import { MP, RawSaleRow, RawFCStockRow, RawRemarkRow, PlanningRow } from '../types';
import { TARGET_STOCK_COVER, MAX_STOCK_COVER } from '../constants';
import { calculateDRR, calculateStockCover, round } from './utils';

interface MPPlanningInput {
  mp: MP;
  sales: RawSaleRow[];
  fcStock: RawFCStockRow[];
  remarks: RawRemarkRow[];
}

export const generateMPPlan = (input: MPPlanningInput): PlanningRow[] => {
  const { mp, sales, fcStock, remarks } = input;
  const plans: PlanningRow[] = [];

  // 1. Group Data by SKU + FC
  // Map Key: `${sku}|${fc}`
  const salesMap = new Map<string, RawSaleRow[]>();
  const stockMap = new Map<string, number>();

  // Filter Sales for this MP
  // Create a set of valid FCs for this MP from FC Stock
  const validFCs = new Set(fcStock.filter(s => s.mp === mp).map(s => s.warehouseId));
  
  // Index Stock
  fcStock.filter(s => s.mp === mp).forEach(row => {
    const key = `${row.sku}|${row.warehouseId}`;
    stockMap.set(key, (stockMap.get(key) || 0) + row.quantity);
  });

  // Index Sales (Only if warehouseId is in validFCs)
  sales.filter(s => s.mp === mp && validFCs.has(s.warehouseId)).forEach(row => {
    const key = `${row.sku}|${row.warehouseId}`;
    if (!salesMap.has(key)) salesMap.set(key, []);
    salesMap.get(key)!.push(row);
  });

  // Remarks Map
  const remarksMap = new Map<string, string>();
  remarks.forEach(r => remarksMap.set(r.styleId, r.companyRemark));

  // 2. Iterate through all known SKU+FC combinations (Union of Stock and Sales)
  const allKeys = new Set([...stockMap.keys(), ...salesMap.keys()]);

  allKeys.forEach(key => {
    const [sku, fc] = key.split('|');
    const salesRows = salesMap.get(key) || [];
    const currentStock = stockMap.get(key) || 0;

    // Derived info from first sale row or lookup (simplified for speed)
    const representativeSale = salesRows[0] || sales.find(s => s.sku === sku); 
    const styleId = representativeSale?.styleId || 'UNKNOWN';
    const uniwareSku = representativeSale?.uniwareSku || 'UNKNOWN';

    // Metrics
    const totalSales30d = salesRows.reduce((sum, r) => sum + r.quantity, 0);
    const drr = calculateDRR(totalSales30d);
    const stockCover = calculateStockCover(currentStock, drr);
    
    // Logic
    let shipmentQty = 0;
    let recallQty = 0;
    let action: 'SHIP' | 'RECALL' | 'NONE' = 'NONE';
    let remarkText = '';

    const companyRemark = remarksMap.get(styleId);

    if (companyRemark === 'Closed') {
      action = 'RECALL';
      recallQty = currentStock; // Full recall
      remarkText = 'Style Closed';
    } else {
      if (stockCover < TARGET_STOCK_COVER) {
        action = 'SHIP';
        // Need = (45 * DRR) - Stock
        shipmentQty = Math.max(0, Math.ceil((TARGET_STOCK_COVER * drr) - currentStock));
      } else if (stockCover > MAX_STOCK_COVER) {
        action = 'RECALL';
        // Recall = Stock - (60 * DRR)
        recallQty = Math.max(0, Math.floor(currentStock - (MAX_STOCK_COVER * drr)));
      }
    }

    if (shipmentQty === 0 && action === 'SHIP') action = 'NONE';
    if (recallQty === 0 && action === 'RECALL') action = 'NONE';

    plans.push({
      id: `${mp}_${fc}_${sku}`,
      mp,
      styleId,
      sku,
      uniwareSku,
      fc,
      sales30d: totalSales30d,
      drr: round(drr),
      fcStock: currentStock,
      stockCover: round(stockCover, 1),
      actualShipmentQty: shipmentQty,
      allocatedQty: 0, // Filled in orchestrator
      recallQty,
      action,
      remarks: remarkText,
      priorityScore: 0,
      isSeller: false
    });
  });

  return plans;
};
