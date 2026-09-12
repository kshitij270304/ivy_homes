'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { useSavedListingsContext } from '@/contexts/SavedListingsContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SavedPage() {
  const { user } = useAuth();
  const { savedIds } = useSavedListingsContext();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      if (savedIds.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const res = await fetchApi(`/api/listings/batch?ids=${savedIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [user, savedIds]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Saved Properties</h1>
      
      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading saved properties...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">You haven't saved any properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(l => <ListingCard key={l.listing_id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
