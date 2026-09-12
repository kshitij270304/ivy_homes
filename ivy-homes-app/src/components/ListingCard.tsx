import Link from 'next/link';
import { useSavedListingsContext } from '@/contexts/SavedListingsContext';
import { useState } from 'react';

export default function ListingCard({ listing }: { listing: any }) {
  const { isSaved, toggleSaved } = useSavedListingsContext();
  const saved = isSaved(listing.listing_id);
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSaved(listing.listing_id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full relative">
      <button 
        onClick={handleToggle}
        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm border ${saved ? 'text-red-500 border-red-200' : 'text-gray-400 border-gray-200 hover:text-red-500'} z-10 transition-colors`}
        title={saved ? "Remove from saved" : "Save listing"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </button>

      {showToast && (
        <div className="absolute top-12 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-20 animate-fade-in-out">
          {saved ? 'Added to saved' : 'Removed from saved'}
        </div>
      )}

      <div className="p-4 flex-grow mt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1" title={listing.apartment_name || listing.locality}>{listing.apartment_name || listing.locality}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded shrink-0 ml-2">
            {listing.property_type}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 capitalize">{listing.locality}</p>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div>
            <span className="text-gray-500 block text-xs">Price</span>
            <p className="font-semibold text-gray-900">₹{(listing.price / 100000).toFixed(2)} L</p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Area</span>
            <p className="font-semibold text-gray-900">{listing.carpet_area} sqft</p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Config</span>
            <p className="font-semibold text-gray-900">{listing.bedroom} BHK</p>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Furnishing</span>
            <p className="font-semibold text-gray-900 capitalize">{listing.furnishing.replace('-', ' ')}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-right">
        <Link href={`/listings/${listing.listing_id}`} className="text-blue-600 font-medium hover:text-blue-800 text-sm">
          View Details →
        </Link>
      </div>
    </div>
  );
}
