import React, { useMemo } from 'react';
import { PlanningRow } from '../types';

interface Props {
  data: PlanningRow[];
  mpName: string;
}

export const DashboardSummaries: React.FC<Props> = ({ data, mpName }) => {

  const fcStockSummary = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(r => {
      map.set(r.fc, (map.get(r.fc) || 0) + r.fcStock);
    });
    return Array.from(map.entries()).map(([fc, total]) => ({ fc, total }));
  }, [data]);

  const fcSalesSummary = useMemo(() => {
    const map = new Map<string, { sale: number; drr: number; stock: number }>();
    data.forEach(r => {
      if (!map.has(r.fc)) map.set(r.fc, { sale: 0, drr: 0, stock: 0 });
      const entry = map.get(r.fc)!;
      entry.sale += r.sales30d;
      entry.drr += r.drr;
      entry.stock += r.fcStock;
    });
    return Array.from(map.entries()).map(([fc, m]) => ({
      fc,
      sale: m.sale,
      drr: m.drr,
      cover: m.drr > 0 ? Math.round(m.stock / m.drr) : 0
    }));
  }, [data]);

  const topSkus = useMemo(() => {
    const map = new Map<string, { sale: number; drr: number }>();
    data.forEach(r => {
      if (!map.has(r.sku)) map.set(r.sku, { sale: 0, drr: 0 });
      const entry = map.get(r.sku)!;
      entry.sale += r.sales30d;
      entry.drr += r.drr;
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].sale - a[1].sale)
      .slice(0, 10)
      .map(([sku, m]) => ({ sku, ...m }));
  }, [data]);

  const topStyles = useMemo(() => {
    const map = new Map<string, { sale: number; drr: number }>();
    data.forEach(r => {
      if (!map.has(r.styleId)) map.set(r.styleId, { sale: 0, drr: 0 });
      const entry = map.get(r.styleId)!;
      entry.sale += r.sales30d;
      entry.drr += r.drr;
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].sale - a[1].sale)
      .slice(0, 10)
      .map(([style, m]) => ({ style, ...m }));
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Summary 1: FC Wise Stock */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">FC Wise Stock</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-2">FC</th>
                <th className="text-right py-2 px-2">Total Stock</th>
              </tr>
            </thead>
            <tbody>
              {fcStockSummary.map(s => (
                <tr key={s.fc} className="border-t border-gray-100">
                  <td className="py-1 px-2">{s.fc}</td>
                  <td className="text-right py-1 px-2 font-medium">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary 2: FC Wise Sale | DRR | Stock Cover */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">FC Performance</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-2">FC</th>
                <th className="text-right py-2 px-2">Sale</th>
                <th className="text-right py-2 px-2">DRR</th>
                <th className="text-right py-2 px-2">Cover</th>
              </tr>
            </thead>
            <tbody>
              {fcSalesSummary.map(s => (
                <tr key={s.fc} className="border-t border-gray-100">
                  <td className="py-1 px-2">{s.fc}</td>
                  <td className="text-right py-1 px-2">{s.sale}</td>
                  <td className="text-right py-1 px-2">{s.drr.toFixed(1)}</td>
                  <td className="text-right py-1 px-2 font-medium">{s.cover}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary 3: MP Wise Top 10 SKUs */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Top 10 SKUs ({mpName})</h4>
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-2">SKU</th>
                <th className="text-right py-2 px-2">Sale</th>
                <th className="text-right py-2 px-2">DRR</th>
              </tr>
            </thead>
            <tbody>
              {topSkus.map(s => (
                <tr key={s.sku} className="border-t border-gray-100">
                  <td className="py-1 px-2 text-xs">{s.sku}</td>
                  <td className="text-right py-1 px-2">{s.sale}</td>
                  <td className="text-right py-1 px-2">{s.drr.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary 4: MP Wise Top 10 Styles */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Top 10 Styles ({mpName})</h4>
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-2">Style</th>
                <th className="text-right py-2 px-2">Sale</th>
                <th className="text-right py-2 px-2">DRR</th>
              </tr>
            </thead>
            <tbody>
              {topStyles.map(s => (
                <tr key={s.style} className="border-t border-gray-100">
                  <td className="py-1 px-2 text-xs">{s.style}</td>
                  <td className="text-right py-1 px-2">{s.sale}</td>
                  <td className="text-right py-1 px-2">{s.drr.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};