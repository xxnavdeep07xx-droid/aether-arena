'use client';

import { useAppStore, useSearchStore } from '@/lib/store';
import { useState } from 'react';
import { X } from 'lucide-react';

export function SearchBarInput() {
  const { currentView } = useAppStore();
  const { query, setQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setQuery(val);
  };

  const placeholder =
    currentView === 'home' ? 'Search tournaments, players...':
    currentView === 'tournaments' ? 'Search tournaments...':
    currentView === 'leaderboard' ? 'Search players...':
    'Search streams...';

  return (
    <div className="relative">
      <input type="text" value={localQuery} onChange={handleChange} placeholder={placeholder}
        className="w-full bg-arena-card border border-arena-border rounded-xl pl-10 pr-9 py-2.5 h-10 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" />
      {localQuery && (
        <button onClick={() => { setLocalQuery(''); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-white transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
