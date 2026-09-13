'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const loadRentals = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(`/v1/rentals?limit=50&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to load rentals');
      
      const data = await res.json();
      setRentals(prev => {
        const unique = data.results.filter((r: any) => !prev.some(p => p.listing_id === r.listing_id));
        return [...prev, ...unique];
      });
      setHasMore(data.has_more);
      setOffset(offset + 50);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRentals();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Properties for Rent</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rentals.map(r => (
          <div key={r.listing_id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col p-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
            <div className="flex-grow">
              <h3 className="font-semibold text-lg mb-1">{r.apartment_name || r.locality}</h3>
              <p className="text-gray-600 text-sm mb-4 capitalize">{r.locality}</p>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Rent:</span>
                  <p className="font-semibold text-gray-900">₹{r.price.toLocaleString('en-IN')}/mo</p>
                </div>
                <div>
                  <span className="text-gray-500">Deposit:</span>
                  <p className="font-semibold text-gray-900">₹{r.deposit.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Config:</span>
                  <p className="font-semibold text-gray-900">{r.bedroom} BHK</p>
                </div>
                <div>
                  <span className="text-gray-500">Area:</span>
                  <p className="font-semibold text-gray-900">{r.carpet_area} sqft</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-center py-8 text-gray-500">Loading...</p>}
      
      {!loading && hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={loadRentals}
            className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
