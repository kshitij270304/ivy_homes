'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnishing, setFurnishing] = useState('');

  const loadListings = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const params = new URLSearchParams({ offset: currentOffset.toString(), limit: '50' });
      if (locality) params.append('locality', locality.toLowerCase());
      if (bhk) params.append('bhk', bhk);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (furnishing) params.append('furnishing', furnishing);

      const res = await fetchApi(`/v1/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load listings');
      
      const data = await res.json();
      
      let results = data.results;
      if (locality) results = results.filter((r: any) => r.locality.toLowerCase() === locality.toLowerCase());
      if (bhk) results = results.filter((r: any) => r.bedroom.toString() === bhk);
      if (minPrice) results = results.filter((r: any) => r.price >= parseInt(minPrice));
      if (maxPrice) results = results.filter((r: any) => r.price <= parseInt(maxPrice));
      if (furnishing) results = results.filter((r: any) => r.furnishing === furnishing);

      setListings(prev => {
        if (reset) return results;
        const unique = results.filter((r: any) => !prev.some((p:any) => p.listing_id === r.listing_id));
        return [...prev, ...unique];
      });
      setHasMore(data.has_more);
      setOffset(currentOffset + 50);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings(true);
  }, [locality, bhk, minPrice, maxPrice, furnishing]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar Filters */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Apartment / Location</label>
              <div className="relative">
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Search upto 3 localities" 
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Select BHK</label>
              <div className="flex flex-wrap gap-2">
                {['1', '2', '3', '4'].map(val => (
                  <button
                    key={val}
                    onClick={() => setBhk(bhk === val ? '' : val)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                      bhk === val 
                        ? 'border-blue-800 text-blue-800 bg-blue-50' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {val} BHK
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Budget</label>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-1/2 border-b border-gray-200 pb-1 focus:outline-none focus:border-gray-400 bg-transparent text-left"
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-1/2 border-b border-gray-200 pb-1 focus:outline-none focus:border-gray-400 bg-transparent text-right"
                />
              </div>
              {/* Fake dual slider for visual effect matching design */}
              <div className="relative pt-4 pb-2">
                <div className="absolute h-1 w-full bg-gray-200 rounded-full"></div>
                <div className="absolute h-1 w-full bg-gray-900 rounded-full"></div>
                <div className="absolute top-[14px] left-0 w-3 h-3 bg-white border-2 border-gray-900 rounded-full transform -translate-x-1/2"></div>
                <div className="absolute top-[14px] right-0 w-3 h-3 bg-white border-2 border-gray-900 rounded-full transform translate-x-1/2"></div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Property Type</label>
              <div className="flex flex-wrap gap-2">
                {['unfurnished', 'semi-furnished', 'fully-furnished'].map(val => (
                  <button
                    key={val}
                    onClick={() => setFurnishing(furnishing === val ? '' : val)}
                    className={`px-4 py-1.5 rounded-full text-sm border capitalize transition-colors ${
                      furnishing === val 
                        ? 'border-blue-800 text-blue-800 bg-blue-50' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {val.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </aside>

      {/* Right Content */}
      <div className="flex-1">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-6 tracking-tight">Homes in Mumbai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((l, i) => <ListingCard key={l.listing_id + i} listing={l} />)}
        </div>

        {loading && <p className="text-center py-8 text-gray-500">Loading...</p>}
        
        {!loading && hasMore && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => loadListings(false)}
              className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-medium hover:bg-blue-200"
            >
              Load More
            </button>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <p className="text-center py-8 text-gray-500">No properties found matching your filters.</p>
        )}
      </div>
    </div>
  );
}
