'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi('/api/insights');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Calculating insights...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Failed to load insights.</div>;

  const maxBhk = Math.max(...data.bhk_distribution.map((d: any) => d.value));
  const maxProp = Math.max(...data.property_type_distribution.map((d: any) => d.value));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Market Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm font-medium mb-1">Active Listings</p>
          <p className="text-3xl font-bold text-gray-900">{data.total_active_listings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Inventory Value</p>
          <p className="text-3xl font-bold text-gray-900">₹{data.total_inventory_value_cr} Cr</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm font-medium mb-1">Avg Price / Sqft</p>
          <p className="text-3xl font-bold text-gray-900">₹{parseFloat(data.avg_price_per_sqft).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Inventory by Configuration</h2>
          <div className="space-y-4">
            {data.bhk_distribution.map((item: any) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(item.value / maxBhk) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Property Types</h2>
          <div className="space-y-4">
            {data.property_type_distribution.map((item: any) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">{item.name.replace('-', ' ')}</span>
                  <span className="text-gray-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(item.value / maxProp) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
