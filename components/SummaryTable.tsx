import React, { useMemo } from 'react';
import { PlanningRow, SummaryRow } from '../types';

interface Props {
  data: PlanningRow[];
}

export const SummaryTable: React.FC<Props> = ({ data }) => {
  
  const summary = useMemo(() => {
    const map = new Map<string, SummaryRow>();
    
    data.forEach(row => {
        if (!map.has(row.fc)) {
            map.set(row.fc, {
                fc: row.fc,
                totalStock: 0,
                totalSale: 0,
                drr: 0,
                actualShipmentQty: 0,
                allocatedQty: 0,
                recallQty: 0
            });
        }
        const s = map.get(row.fc)!;
        s.totalStock += row.fcStock;
        s.totalSale += row.sales30d;
        s.drr += row.drr;
        s.actualShipmentQty += row.actualShipmentQty; // Sum of calculated needs
        s.allocatedQty += row.allocatedQty; // Sum of capped allocations
        s.recallQty += row.recallQty;
    });

    return Array.from(map.values()).sort((a,b) => a.fc.localeCompare(b.fc));
  }, [data]);

  const grandTotal = useMemo(() => {
    return summary.reduce((acc, curr) => ({
        fc: 'GRAND TOTAL',
        totalStock: acc.totalStock + curr.totalStock,
        totalSale: acc.totalSale + curr.totalSale,
        drr: acc.drr + curr.drr,
        actualShipmentQty: acc.actualShipmentQty + curr.actualShipmentQty,
        allocatedQty: acc.allocatedQty + curr.allocatedQty,
        recallQty: acc.recallQty + curr.recallQty
    }), { fc: 'Total', totalStock: 0, totalSale: 0, drr: 0, actualShipmentQty: 0, allocatedQty: 0, recallQty: 0 });
  }, [summary]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6 mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800">Shipment & Recall Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-600">FC</th>
              <th className="px-4 py-3 text-right font-bold text-gray-600">Total Stock</th>
              <th className="px-4 py-3 text-right font-bold text-gray-600">Total Sale</th>
              <th className="px-4 py-3 text-right font-bold text-gray-600">DRR</th>
              <th className="px-4 py-3 text-right font-bold text-gray-600">Actual Shipment Qty</th>
              <th className="px-4 py-3 text-right font-bold text-green-700 bg-green-50 border-l border-green-100">Shipment Qty (Allocated)</th>
              <th className="px-4 py-3 text-right font-bold text-red-700 bg-red-50 border-l border-red-100">Recall Qty</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.map((row) => (
              <tr key={row.fc} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.fc}</td>
                <td className="px-4 py-3 text-right text-gray-600">{row.totalStock}</td>
                <td className="px-4 py-3 text-right text-gray-600">{row.totalSale}</td>
                <td className="px-4 py-3 text-right text-gray-600">{row.drr.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-600 font-medium">{row.actualShipmentQty}</td>
                <td className="px-4 py-3 text-right font-bold text-green-700 bg-green-50 border-l border-green-100">{row.allocatedQty}</td>
                <td className="px-4 py-3 text-right font-bold text-red-700 bg-red-50 border-l border-red-100">{row.recallQty}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                 <td className="px-4 py-3 text-gray-900">GRAND TOTAL</td>
                 <td className="px-4 py-3 text-right text-gray-900">{grandTotal.totalStock}</td>
                 <td className="px-4 py-3 text-right text-gray-900">{grandTotal.totalSale}</td>
                 <td className="px-4 py-3 text-right text-gray-900">{grandTotal.drr.toFixed(2)}</td>
                 <td className="px-4 py-3 text-right text-gray-900">{grandTotal.actualShipmentQty}</td>
                 <td className="px-4 py-3 text-right text-green-800 bg-green-100 border-l border-green-200">{grandTotal.allocatedQty}</td>
                 <td className="px-4 py-3 text-right text-red-800 bg-red-100 border-l border-red-200">{grandTotal.recallQty}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
