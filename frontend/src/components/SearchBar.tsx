'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (filters: {
    search?: string;
    category?: string;
    location?: string;
  }) => void;
  showTypeFilter?: boolean;
  onTypeChange?: (type: string) => void;
}

const categories = [
  'All Categories',
  'Electronics',
  'Books & Notes',
  'Clothing',
  'Accessories',
  'ID & Cards',
  'Keys',
  'Bags & Wallets',
  'Sports Equipment',
  'Stationery',
  'Other',
];

const locations = [
  'All Locations',
  'Library',
  'Cafeteria',
  'Computer Lab',
  'Main Building',
  'Sports Complex',
  'Auditorium',
  'Parking Lot',
  'Hostel',
  'Classroom',
  'Lab',
  'Other',
];

export default function SearchBar({ onSearch, showTypeFilter, onTypeChange }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: search || undefined,
      category: category || undefined,
      location: location || undefined,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch({
      search: value || undefined,
      category: category || undefined,
      location: location || undefined,
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-white placeholder-dark-300 focus:ring-2 focus:ring-accent-purple/50 transition-all duration-200"
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl glass text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            showFilters ? 'text-accent-purple border-accent-purple/30' : 'text-dark-200 hover:text-white'
          }`}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
        </motion.button>

        {showTypeFilter && (
          <div className="flex gap-1 p-1 rounded-xl glass">
            {['all', 'lost', 'found'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange?.(type)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  type === 'all' ? 'text-dark-200 hover:text-white' : ''
                }`}
              >
                {type === 'lost' ? '🔴 ' : type === 'found' ? '🟢 ' : ''}{type}
              </button>
            ))}
          </div>
        )}
      </form>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 mt-3">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  onSearch({
                    search: search || undefined,
                    category: e.target.value || undefined,
                    location: location || undefined,
                  });
                }}
                className="flex-1 px-4 py-3 rounded-xl glass text-white bg-transparent appearance-none cursor-pointer text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All Categories' ? '' : cat} className="bg-dark-800">
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  onSearch({
                    search: search || undefined,
                    category: category || undefined,
                    location: e.target.value || undefined,
                  });
                }}
                className="flex-1 px-4 py-3 rounded-xl glass text-white bg-transparent appearance-none cursor-pointer text-sm"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc === 'All Locations' ? '' : loc} className="bg-dark-800">
                    {loc}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setLocation('');
                  onSearch({});
                }}
                className="px-4 py-3 rounded-xl text-xs text-dark-300 hover:text-white glass transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
