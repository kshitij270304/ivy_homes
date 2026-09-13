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
  const maxLoc = data.by_locality?.length > 0 ? Math.max(...data.by_locality.map((d: any) => d.count)) : 1;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Market Insights — {data.city?.charAt(0).toUpperCase() + data.city?.slice(1)}</h1>
      <p className="text-gray-500 mb-6 text-sm">Real-time analytics computed from {data.total_listings?.toLocaleString()} retrievable listing records</p>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Total Listings</p>
          <p className="text-2xl font-bold text-gray-900">{data.total_listings?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Active Listings</p>
          <p className="text-2xl font-bold text-green-700">{data.total_active_listings?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Inactive Served</p>
          <p className="text-2xl font-bold text-red-600">{data.total_inactive_listings?.toLocaleString()}</p>
          <p className="text-[10px] text-red-400 mt-0.5">Docs claim excluded</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900">₹{data.total_inventory_value_cr} Cr</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Median Price</p>
          <p className="text-2xl font-bold text-gray-900">₹{(data.median_price / 10000000).toFixed(2)} Cr</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Median ₹/sqft</p>
          <p className="text-2xl font-bold text-gray-900">₹{data.median_price_per_sqft?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium mb-1">Avg ₹/sqft</p>
          <p className="text-2xl font-bold text-gray-900">₹{parseFloat(data.avg_price_per_sqft).toLocaleString()}</p>
        </div>
      </div>

      {/* Locality Breakdown */}
      {data.by_locality && data.by_locality.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-5">By Locality (Top 10)</h2>
          <div className="space-y-3">
            {data.by_locality.map((item: any) => (
              <div key={item.locality}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">{item.locality}</span>
                  <span className="text-gray-500">{item.count} listings · Median ₹{(item.median_price / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.count / maxLoc) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BHK + Property Type Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-5">Inventory by Configuration</h2>
          <div className="space-y-3">
            {data.bhk_distribution.map((item: any) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.value / maxBhk) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-5">Property Types</h2>
          <div className="space-y-3">
            {data.property_type_distribution.map((item: any) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">{item.name?.replace('-', ' ')}</span>
                  <span className="text-gray-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(item.value / maxProp) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Discoveries */}
      {data.discoveries && (
        <>
          <h2 className="text-2xl font-bold mb-4 mt-10">🔍 Data Quality Discoveries</h2>
          <p className="text-gray-500 text-sm mb-6">Issues found by analysing the complete dataset — things the documentation didn&apos;t tell you.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
              <p className="text-red-800 text-xs font-semibold mb-1">⚠️ Corrupt Listings</p>
              <p className="text-3xl font-bold text-red-700">{data.discoveries.corrupt_listings_count}</p>
              <p className="text-red-600 text-xs mt-1">Impossible values (negative price, floor &gt; total, etc.)</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl">
              <p className="text-orange-800 text-xs font-semibold mb-1">🚨 Suspected Fake Listings</p>
              <p className="text-3xl font-bold text-orange-700">{data.discoveries.fake_listings_count}</p>
              <p className="text-orange-600 text-xs mt-1">Same phone, multiple broker names (enquiry bait)</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl">
              <p className="text-yellow-800 text-xs font-semibold mb-1">📋 Duplicate Properties</p>
              <p className="text-3xl font-bold text-yellow-700">{data.discoveries.duplicate_property_groups}</p>
              <p className="text-yellow-600 text-xs mt-1">Same property listed across multiple websites</p>
            </div>
          </div>

          {/* Corrupt examples */}
          {data.discoveries.corrupt_examples?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-lg mb-3">Corrupt Listing Examples</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 pr-4 text-gray-500 font-medium">Listing ID</th><th className="text-left py-2 text-gray-500 font-medium">Issue</th></tr></thead>
                  <tbody>
                    {data.discoveries.corrupt_examples.map((ex: any) => (
                      <tr key={ex.listing_id} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-mono text-xs text-blue-700">{ex.listing_id}</td>
                        <td className="py-2 text-gray-700">{ex.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Broker rings */}
          {data.discoveries.suspicious_broker_rings?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h3 className="font-bold text-lg mb-3">Suspicious Broker Rings</h3>
              <p className="text-gray-500 text-xs mb-3">Phone numbers posting under multiple distinct names — a strong signal of enquiry-bait fraud.</p>
              <div className="space-y-3">
                {data.discoveries.suspicious_broker_rings.map((ring: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-mono text-xs text-gray-600 mb-1">{ring.phone} — {ring.alias_count} aliases</p>
                    <p className="text-sm text-gray-800">{ring.aliases.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive note */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl mb-6">
            <p className="font-semibold text-amber-900 mb-1">📝 Documentation Discrepancy: Inactive Listings</p>
            <p className="text-amber-800 text-sm">{data.discoveries.inactive_note}</p>
            <p className="text-amber-700 text-sm mt-1">Found <strong>{data.discoveries.inactive_served}</strong> listings with <code className="bg-amber-100 px-1 rounded">is_live=false</code> that the API still returns.</p>
          </div>
        </>
      )}
    </div>
  );
}

