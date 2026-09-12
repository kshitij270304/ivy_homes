'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { useSavedListingsContext } from '@/contexts/SavedListingsContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SavedPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { savedIds, isLoading: isLoadingSaved } = useSavedListingsContext();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      if (isLoadingSaved) return;
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
  }, [user, savedIds, isLoadingSaved]);

  if (isAuthLoading) return <p className="py-10 text-center text-gray-500">Checking your session...</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Sign in to view saved homes</h1>
        <p className="mt-2 text-gray-600">Your saved properties are personal to your Ivy Homes account.</p>
        <Link href="/login" className="mt-6 inline-block rounded-full bg-blue-800 px-5 py-2.5 font-medium text-white hover:bg-blue-900">
          Sign in
        </Link>
      </div>
    );
  }

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
