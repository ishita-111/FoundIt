'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getItems } from '@/lib/api';
import ItemCard from '@/components/ItemCard';
import { ClipboardList, Search, Package, Inbox } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

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
  postedBy: { _id: string; name: string; studentId: string };
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const data = await getItems({});
        const items = data.items.filter(
          (item: Item) => item.postedBy._id === user?._id
        );
        setMyItems(items);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyItems();
  }, [user]);

  const lostCount = myItems.filter((i) => i.type === 'lost').length;
  const foundCount = myItems.filter((i) => i.type === 'found').length;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="glass-strong rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center text-white text-3xl font-bold shrink-0 glow-purple">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-dark-300 text-sm">{user?.email}</p>
              <p className="text-dark-400 text-xs mt-1">Student ID: {user?.studentId}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Total Posts', value: myItems.length, icon: ClipboardList },
              { label: 'Lost Reports', value: lostCount, icon: Search },
              { label: 'Found Reports', value: foundCount, icon: Package },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2 mt-1">
                  <GradientIcon Icon={stat.icon} size={28} />
                </div>
                <p className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-dark-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">My Items</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-72 animate-shimmer" />
              ))}
            </div>
          ) : myItems.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center flex flex-col items-center">
              <GradientIcon Icon={Inbox} size={48} className="mb-4 opacity-70" />
              <p className="text-dark-200 text-lg mb-2">No items posted yet</p>
              <p className="text-dark-300 text-sm">Start by reporting a lost or found item</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myItems.map((item, i) => (
                <ItemCard key={item._id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
