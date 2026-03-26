'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getItems } from '@/lib/api';
import ItemCard from '@/components/ItemCard';
import SearchBar from '@/components/SearchBar';

interface Item {
  _id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  images: string[];
  status: string;
  postedBy: { name: string; studentId: string };
  createdAt: string;
}

export default function LostItemsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async (filters: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const data = await getItems({ ...filters, type: 'lost', page: String(page) }, token || undefined);
      setItems(data.items);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch lost items:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (filters: { search?: string; category?: string; location?: string }) => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.location) params.location = filters.location;
    setPage(1);
    fetchItems(params);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">🔍 Lost Items</h1>
        <p className="text-dark-300">Browse items that have been reported as lost</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-72 animate-shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-dark-200 text-lg mb-2">No lost items found</p>
          <p className="text-dark-300 text-sm">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <ItemCard key={item._id} item={item} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg glass text-sm text-dark-200 hover:text-white disabled:opacity-30 transition-all"
              >
                ← Prev
              </button>
              <span className="text-dark-300 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg glass text-sm text-dark-200 hover:text-white disabled:opacity-30 transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
