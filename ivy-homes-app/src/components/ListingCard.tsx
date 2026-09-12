import Link from 'next/link';
import { useSavedListingsContext } from '@/contexts/SavedListingsContext';
import { useState } from 'react';

export default function ListingCard({ listing }: { listing: any }) {
  const { isSaved, toggleSaved } = useSavedListingsContext();
  const saved = isSaved(listing.listing_id);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await toggleSaved(listing.listing_id);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to update saved properties.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col group relative h-full p-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg z-20 animate-fade-in-out pointer-events-none">
          {saved ? 'Added to saved' : 'Removed from saved'}
        </div>
      )}

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <Link href={`/listings/${listing.listing_id}`}>
            <h3 className="font-bold text-gray-900 text-[16px] hover:text-blue-700 transition-colors line-clamp-1">
              {listing.apartment_name || 'Independent House'}
            </h3>
          </Link>
          <p className="font-bold text-gray-900 text-[16px] whitespace-nowrap ml-3">
            ₹ {(listing.price / 10000000).toFixed(2)} Cr
          </p>
        </div>
        
        <p className="text-gray-500 text-[13px] capitalize mb-6 line-clamp-1">
          {listing.locality}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-2 text-gray-500">
            {/* Bed Icon & Count */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1 text-[11px] font-medium bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              {listing.bedroom}
            </div>
            
            {/* Area Icon & Count */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1 text-[11px] font-medium bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              {listing.carpet_area.toLocaleString()} sq. ft.
            </div>

            {/* Floor Icon & Count */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2 py-1 text-[11px] font-medium bg-gray-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {listing.floor}{listing.floor === 1 ? 'st' : listing.floor === 2 ? 'nd' : listing.floor === 3 ? 'rd' : 'th'} Floor
            </div>
          </div>
          
          <button 
            onClick={handleToggle}
            disabled={saving}
            aria-label={saved ? 'Remove from saved properties' : 'Save property'}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            {saved ? (
               <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
            ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
