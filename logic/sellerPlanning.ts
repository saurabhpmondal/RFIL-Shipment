import { MP, RawSaleRow, RawFCStockRow, RawRemarkRow, PlanningRow } from '../types';
import { TARGET_STOCK_COVER, FALLBACK_FCS } from '../constants';
import { calculateDRR, round } from './utils';

interface SellerPlanningInput {
  sales: RawSaleRow[];
  fcStock: RawFCStockRow[]; // Needed to identify what is NOT an FC
  remarks: RawRemarkRow[];
}

export const generateSellerPlan = (input: SellerPlanningInput): PlanningRow[] => {
  const { sales, fcStock, remarks } = input;
  const plans: PlanningRow[] = [];

  // 1. Identify Valid FCs (MPs) to exclude them from Seller logic
  const validFCs = new Set(fcStock.map(s => s.warehouseId));

  // 2. Identify Seller Sales
  // Condition: Sale Warehouse ID is NOT in validFCs
  const sellerSales = sales.filter(s => !validFCs.has(s.warehouseId));

  // 3. Group by SKU + MP (Seller logic is still MP aware for destination selection)
  const groupedSales = new Map<string, RawSaleRow[]>();
  
  sellerSales.forEach(row => {
    // Key: MP + SKU. We need to plan per MP.
    const key = `${row.mp}|${row.sku}`;
    if (!groupedSales.has(key)) groupedSales.set(key, []);
    groupedSales.get(key)!.push(row);
  });

  // Remarks Map
  const remarksMap = new Map<string, string>();
  remarks.forEach(r => remarksMap.set(r.styleId, r.companyRemark));

  // 4. Iterate Groups
  groupedSales.forEach((rows, key) => {
    const [mpStr, sku] = key.split('|');
    const mp = mpStr as MP; // This is the MP where the sale happened (e.g. Amazon)
    
    // Representative
    const rep = rows[0];
    const styleId = rep.styleId;
    const uniwareSku = rep.uniwareSku;

    const companyRemark = remarksMap.get(styleId);

    // If Closed, no seller shipment
    if (companyRemark === 'Closed') return;

    const totalSales30d = rows.reduce((sum, r) => sum + r.quantity, 0);
    const drr = calculateDRR(totalSales30d);

    // Target FC Selection
    const fallbackList = FALLBACK_FCS[mp] || ['DEFAULT_FC'];
    const targetFC = fallbackList[0]; 

    // Required Qty
    const shipmentQty = Math.ceil(TARGET_STOCK_COVER * drr);

    if (shipmentQty > 0) {
      plans.push({
        id: `SELLER_${mp}_${targetFC}_${sku}`,
        mp: MP.SELLER, // Marked as Seller plan
        styleId,
        sku,
        uniwareSku,
        fc: targetFC,
        sales30d: totalSales30d,
        drr: round(drr),
        fcStock: 0,
        stockCover: 0,
        actualShipmentQty: shipmentQty,
        allocatedQty: 0, // Filled in orchestrator
        recallQty: 0,
        action: 'SHIP',
        remarks: `Seller Replenishment to ${mp}`,
        priorityScore: 0,
        isSeller: true
      });
    }
  });

  return plans;
};
