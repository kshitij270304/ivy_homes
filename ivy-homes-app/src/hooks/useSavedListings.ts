import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useSavedListings() {
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

  return { savedIds, toggleSaved, isSaved };
}
