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
      
      // Server-side filtering validation (just in case the server lied)
      let results = data.results;
      if (locality) results = results.filter((r: any) => r.locality.toLowerCase() === locality.toLowerCase());
      if (bhk) results = results.filter((r: any) => r.bedroom.toString() === bhk);
      if (minPrice) results = results.filter((r: any) => r.price >= parseInt(minPrice));
      if (maxPrice) results = results.filter((r: any) => r.price <= parseInt(maxPrice));
      if (furnishing) results = results.filter((r: any) => r.furnishing === furnishing);

      setListings(prev => {
        if (reset) return results;
        const unique = results.filter((r: any) => !prev.some(p => p.listing_id === r.listing_id));
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Properties for Sale</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Locality</label>
          <input 
            type="text" 
            placeholder="e.g. Andheri West" 
            value={locality}
            onChange={e => setLocality(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">BHK</label>
          <select value={bhk} onChange={e => setBhk(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
          <input 
            type="number" 
            placeholder="₹" 
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
          <input 
            type="number" 
            placeholder="₹" 
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing</label>
          <select value={furnishing} onChange={e => setFurnishing(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
            <option value="">Any</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="fully-furnished">Fully-furnished</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((l, i) => <ListingCard key={l.listing_id + i} listing={l} />)}
      </div>

      {loading && <p className="text-center py-8 text-gray-500">Loading...</p>}
      
      {!loading && hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => loadListings(false)}
            className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-200"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-center py-8 text-gray-500">No properties found matching your filters.</p>
      )}
    </div>
  );
}
