'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SavedListingsContextType {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedListingsContext = createContext<SavedListingsContextType>({} as any);

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(`saved_${user.email}`);
      if (stored) {
        setSavedIds(JSON.parse(stored));
      } else {
        setSavedIds([]);
      }
    } else {
      setSavedIds([]);
    }
  }, [user]);

  const toggleSaved = (id: string) => {
    if (!user?.email) return;
    
    setSavedIds(prev => {
      const newIds = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(`saved_${user.email}`, JSON.stringify(newIds));
      return newIds;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return (
    <SavedListingsContext.Provider value={{ savedIds, toggleSaved, isSaved }}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export const useSavedListingsContext = () => useContext(SavedListingsContext);
