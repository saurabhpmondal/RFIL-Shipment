import React, { useMemo, useState } from 'react';
import { PlanningRow } from '../types';

interface Props {
  data: PlanningRow[];
  type: 'MP' | 'SELLER';
}

export const PlanningTable: React.FC<Props> = ({ data, type }) => {
  const [filter, setFilter] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(row => 
      row.sku.toLowerCase().includes(filter.toLowerCase()) ||
      row.styleId.toLowerCase().includes(filter.toLowerCase()) ||
      row.fc.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800">{type === 'MP' ? 'Shipment & Recall Report' : 'Seller Replenishment Report'}</h3>
        <input 
          type="text" 
          placeholder="Filter SKU/Style/FC..." 
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Style</th>
              <th className="px-3 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">SKU</th>
              <th className="px-3 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">FC</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">Sale Qty</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">DRR</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">FC Stock</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">Cover</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">Actual Shipment Qty</th>
              <th className="px-3 py-3 text-center font-bold text-green-700 bg-green-50 uppercase tracking-wider border-l border-green-100">Shipment Qty</th>
              <th className="px-3 py-3 text-center font-bold text-red-700 bg-red-50 uppercase tracking-wider border-l border-red-100">Recall Qty</th>
              <th className="px-3 py-3 text-center font-bold text-gray-600 uppercase tracking-wider">Action</th>
              <th className="px-3 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-medium">{row.styleId}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">{row.sku}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{row.fc}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap text-gray-500">{row.sales30d}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap text-gray-500">{row.drr}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap text-gray-500">{row.fcStock}</td>
                <td className={`px-3 py-2 text-center whitespace-nowrap font-medium ${
                  row.stockCover < 45 ? 'text-red-600' : row.stockCover > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {row.stockCover}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap font-medium text-gray-500">{row.actualShipmentQty}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap font-bold text-green-700 bg-green-50 border-l border-green-100">{row.allocatedQty}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap text-red-700 bg-red-50 border-l border-red-100">{row.recallQty}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    row.action === 'SHIP' ? 'bg-green-100 text-green-800' : 
                    row.action === 'RECALL' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.action}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{row.remarks}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-4 text-center text-gray-500">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
