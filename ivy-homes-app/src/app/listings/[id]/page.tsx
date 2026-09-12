'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ListingDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      try {
        const res = await fetch(`/api/listing/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Listing not found' : 'Failed to load');
        }
        
        setListing(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!listing) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.apartment_name || listing.locality}</h1>
            <p className="text-gray-600 text-lg capitalize">{listing.locality}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">₹{(listing.price / 100000).toFixed(2)} L</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${listing.is_live ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {listing.is_live ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500">Property Type</p>
            <p className="font-medium">{listing.property_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="font-medium">{listing.bedroom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bathrooms</p>
            <p className="font-medium">{listing.bathroom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Balconies</p>
            <p className="font-medium">{listing.balcony}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Carpet Area</p>
            <p className="font-medium">{listing.carpet_area} sqft</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Super Built-up Area</p>
            <p className="font-medium">{listing.super_built_up_area} sqft</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Floor</p>
            <p className="font-medium">{listing.floor} of {listing.total_floors}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Furnishing</p>
            <p className="font-medium capitalize">{listing.furnishing.replace('-', ' ')}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-8">{listing.description}</p>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contact Details</h2>
          <p className="font-medium text-gray-900">{listing.posted_by_name} ({listing.posted_by})</p>
          <p className="text-gray-700">{listing.posted_by_contact}</p>
        </div>
      </div>
    </div>
  );
}
