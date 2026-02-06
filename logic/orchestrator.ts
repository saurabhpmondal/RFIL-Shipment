import { MP, RawSaleRow, RawFCStockRow, RawUniwareStockRow, RawRemarkRow, PlanningRow } from '../types';
import { generateMPPlan } from './mpPlanning';
import { generateSellerPlan } from './sellerPlanning';
import { UNIWARE_ALLOCATION_CAP } from '../constants';

export const calculateAllPlans = (
  sales: RawSaleRow[],
  fcStock: RawFCStockRow[],
  uniwareStock: RawUniwareStockRow[],
  remarks: RawRemarkRow[]
): PlanningRow[] => {
  
  // 1. Generate Individual Plans
  const amazonPlan = generateMPPlan({ mp: MP.AMAZON, sales, fcStock, remarks });
  const flipkartPlan = generateMPPlan({ mp: MP.FLIPKART, sales, fcStock, remarks });
  const myntraPlan = generateMPPlan({ mp: MP.MYNTRA, sales, fcStock, remarks });
  const sellerPlan = generateSellerPlan({ sales, fcStock, remarks });

  let allPlans = [...amazonPlan, ...flipkartPlan, ...myntraPlan, ...sellerPlan];

  // 2. Global Allocation Logic
  
  // Map<UniwareSku, Quantity>
  const globalAvailableStock = new Map<string, number>();
  uniwareStock.forEach(u => {
    globalAvailableStock.set(u.uniwareSku, Math.floor(u.quantity * UNIWARE_ALLOCATION_CAP));
  });

  // Calculate Total Demand per Uniware SKU
  const totalDemandPerUniwareSku = new Map<string, number>();
  allPlans.forEach(p => {
    if (p.action === 'SHIP') {
      const current = totalDemandPerUniwareSku.get(p.uniwareSku) || 0;
      totalDemandPerUniwareSku.set(p.uniwareSku, current + p.actualShipmentQty);
    }
  });

  // Allocation Pass
  // We don't strictly need to sort by priority if we use proportional allocation (DW wise).
  // "Divided as per DW wise replenishment" implies if Stock < Demand, everyone gets `(Req / TotalReq) * Stock`.
  // This is fairer than fulfilling one FC completely and starving another.
  
  allPlans.forEach(p => {
    if (p.action === 'SHIP') {
        const available = globalAvailableStock.get(p.uniwareSku) || 0;
        const totalDemand = totalDemandPerUniwareSku.get(p.uniwareSku) || 0;

        if (totalDemand === 0) {
            p.allocatedQty = 0;
        } else if (available >= totalDemand) {
            // Full allocation possible
            p.allocatedQty = p.actualShipmentQty;
        } else {
            // Partial allocation based on Demand Weight (Proportional)
            const share = p.actualShipmentQty / totalDemand;
            p.allocatedQty = Math.floor(share * available);
            
            p.remarks += (p.remarks ? ' | ' : '') + `Capped by Stock (Need: ${p.actualShipmentQty})`;
        }

        // Handle edge case where proportional logic floors to 0 but demand exists
        // (Optional: Round Robin could be used here but strict floor is safer to not exceed cap)
        if (p.allocatedQty === 0 && p.actualShipmentQty > 0) {
             p.remarks += (p.remarks ? ' | ' : '') + 'Out of Stock';
        }
    } else {
        p.allocatedQty = 0;
    }
  });

  // Sort purely for UI presentation (Desc DRR is good)
  allPlans.sort((a, b) => b.drr - a.drr);

  return allPlans;
};
