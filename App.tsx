import React, { useEffect, useState, useMemo } from 'react';
import { MP, PlanningRow } from './types';
import { fetchAndNormalizeData } from './services/dataService';
import { calculateAllPlans } from './logic/orchestrator';
import { PlanningTable } from './components/PlanningTable';
import { SummaryTable } from './components/SummaryTable';
import { DashboardSummaries } from './components/DashboardSummaries';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ allPlans: PlanningRow[] } | null>(null);
  const [activeTab, setActiveTab] = useState<string>(MP.AMAZON);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchAndNormalizeData();
        
        // Basic validation before processing
        if (raw.sales.length === 0) {
           throw new Error("Sales data is empty. Please check the 'Sale 30D' sheet.");
        }

        const allPlans = calculateAllPlans(raw.sales, raw.fcStock, raw.uniwareStock, raw.remarks);
        setData({ allPlans });
      } catch (e: any) {
        console.error("Failed to load data", e);
        setError(e.message || "An unexpected error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredPlans = useMemo(() => {
    if (!data) return [];
    if (activeTab === MP.SELLER) {
        return data.allPlans.filter(p => p.isSeller);
    }
    return data.allPlans.filter(p => p.mp === activeTab && !p.isSeller);
  }, [data, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading and Computing Shipment Plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full border-l-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Data Loading Error</h2>
            <div className="bg-red-50 p-4 rounded text-red-800 font-mono text-sm whitespace-pre-wrap">
              {error}
            </div>
            <p className="mt-4 text-gray-600">
              Please verify that the Google Sheets are published correctly (File > Share > Publish to web > CSV) and the column headers match the requirements.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shipment Planner</h1>
            <p className="text-gray-500 mt-2">Automated allocation for Amazon, Flipkart, Myntra & Seller</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="-mb-px flex space-x-8">
            {[MP.AMAZON, MP.FLIPKART, MP.MYNTRA, MP.SELLER].map((mp) => (
              <button
                key={mp}
                onClick={() => setActiveTab(mp)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === mp 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {mp}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {data && (
            <>
                {/* 2x2 Dashboard Grid - Only for MPs */}
                {activeTab !== MP.SELLER && (
                    <DashboardSummaries data={filteredPlans} mpName={activeTab} />
                )}

                {/* Shipment & Recall Summary - Only for MPs */}
                {activeTab !== MP.SELLER && (
                    <SummaryTable data={filteredPlans} />
                )}

                {/* Main Detailed Report Table */}
                <PlanningTable 
                    data={filteredPlans} 
                    type={activeTab === MP.SELLER ? 'SELLER' : 'MP'} 
                />
            </>
        )}
      </div>
    </div>
  );
}

export default App;
