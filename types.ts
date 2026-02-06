export enum MP {
  AMAZON = 'Amazon IN',
  FLIPKART = 'Flipkart',
  MYNTRA = 'Myntra',
  SELLER = 'SELLER' // Derived type, not in raw data
}

export interface RawSaleRow {
  mp: string;
  date: string;
  sku: string;
  channelId: string;
  quantity: number;
  warehouseId: string;
  fulfillmentType: string;
  uniwareSku: string;
  styleId: string;
  size: string;
}

export interface RawFCStockRow {
  mp: string;
  warehouseId: string;
  sku: string;
  channelId: string;
  quantity: number;
}

export interface RawUniwareStockRow {
  uniwareSku: string;
  quantity: number;
}

export interface RawRemarkRow {
  styleId: string;
  category: string;
  companyRemark: string;
}

export interface PlanningRow {
  id: string; // Unique key for UI
  mp: MP;
  styleId: string;
  sku: string;
  uniwareSku: string;
  fc: string;
  sales30d: number;
  drr: number;
  fcStock: number;
  stockCover: number;
  actualShipmentQty: number; // Calculated need (45 Days)
  allocatedQty: number; // Actual allocated (Limited by 40% Uniware Cap)
  recallQty: number;
  action: 'SHIP' | 'RECALL' | 'NONE';
  remarks: string;
  priorityScore: number;
  isSeller?: boolean;
}

export interface SummaryRow {
  fc: string;
  totalStock: number;
  totalSale: number;
  drr: number;
  actualShipmentQty: number;
  allocatedQty: number;
  recallQty: number;
}

export interface DataContextState {
  sales: RawSaleRow[];
  fcStock: RawFCStockRow[];
  uniwareStock: RawUniwareStockRow[];
  remarks: RawRemarkRow[];
  isLoaded: boolean;
}
