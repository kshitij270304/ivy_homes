'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from './AuthContext';

interface SavedListingsContextType {
  savedIds: string[];
  isLoading: boolean;
  toggleSaved: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
}

const SavedListingsContext = createContext<SavedListingsContextType>({} as SavedListingsContextType);

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user?.email) {
      setSavedIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi('/v1/saved');
      if (!res.ok) throw new Error('Unable to load saved properties.');
      const data = await res.json();
      setSavedIds((data.results ?? []).map((listing: { listing_id: string }) => listing.listing_id));
    } catch (error) {
      console.error(error);
      setSavedIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const toggleSaved = async (id: string) => {
    if (!user?.email) throw new Error('Please sign in to save a property.');

    const alreadySaved = savedIds.includes(id);
    const res = await fetchApi(
      alreadySaved ? `/v1/saved/${encodeURIComponent(id)}` : '/v1/saved',
      alreadySaved
        ? { method: 'DELETE' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: id }),
          },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || 'Unable to update saved properties.');
    }

    setSavedIds((previous) =>
      alreadySaved ? previous.filter((savedId) => savedId !== id) : [...previous, id],
    );
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return (
    <SavedListingsContext.Provider value={{ savedIds, isLoading, toggleSaved, isSaved }}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export const useSavedListingsContext = () => useContext(SavedListingsContext);
