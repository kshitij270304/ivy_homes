'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(`/v1/projects?limit=50&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to load projects');
      
      const data = await res.json();
      setProjects(prev => {
        const unique = data.results.filter((r: any) => !prev.some(p => p.project_id === r.project_id));
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
    loadProjects();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Builder Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(p => (
          <div key={p.project_id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col p-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{p.apartment_name}</h3>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${p.project_status === 'ready to move' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {p.project_status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">By {p.developer_name}</p>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Price Range:</span>
                  <p className="font-semibold text-gray-900">
                    ₹{p.price_min} Cr - ₹{p.price_max} Cr
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Area Range:</span>
                  <p className="font-semibold text-gray-900">
                    {p.min_area_sqft} - {p.max_area_sqft} sqft
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Locality:</span>
                  <p className="font-semibold text-gray-900 capitalize">{p.locality}</p>
                </div>
                <div>
                  <span className="text-gray-500">Listings:</span>
                  <p className="font-semibold text-gray-900">{p.total_listings} Available</p>
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
            onClick={loadProjects}
            className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
