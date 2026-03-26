'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getItems } from '@/lib/api';
import ItemCard from '@/components/ItemCard';
import { ClipboardList, Search, Package, CheckCircle2, Plus, Link as LinkIcon, Inbox } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface DashboardItem {
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

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [recentItems, setRecentItems] = useState<DashboardItem[]>([]);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allData, lostData, foundData] = await Promise.all([
          getItems({ limit: '8' }, token || undefined),
          getItems({ type: 'lost' }, token || undefined),
          getItems({ type: 'found' }, token || undefined),
        ]);

        setRecentItems(allData.items);
        setStats({
          total: allData.total,
          lost: lostData.total,
          found: foundData.total,
          resolved: 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const statCards = [
    { label: 'Total Items', value: stats.total, icon: ClipboardList, color: 'from-accent-purple to-accent-blue' },
    { label: 'Lost Items', value: stats.lost, icon: Search, color: 'from-red-500 to-pink-500' },
    { label: 'Found Items', value: stats.found, icon: Package, color: 'from-emerald-500 to-teal-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-dark-300">Here&apos;s what&apos;s happening on campus today</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 group hover:border-accent-purple/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <GradientIcon Icon={stat.icon} size={28} />
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{loading ? '—' : stat.value}</p>
            <p className="text-xs text-dark-300">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        <Link href="/dashboard/post">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium text-sm flex items-center gap-2 glow-purple"
          >
            <GradientIcon Icon={Plus} size={18} /> Report Item
          </motion.button>
        </Link>
        <Link href="/dashboard/lost">
          <button className="px-6 py-3 rounded-xl glass text-dark-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
            <Search size={16} className="text-accent-cyan" /> Browse Lost
          </button>
        </Link>
        <Link href="/dashboard/found">
          <button className="px-6 py-3 rounded-xl glass text-dark-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
            <Package size={16} className="text-accent-purple" /> Browse Found
          </button>
        </Link>
        <Link href="/dashboard/matches">
          <button className="px-6 py-3 rounded-xl glass text-dark-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
            <LinkIcon size={16} className="text-accent-blue" /> My Matches
          </button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Items</h2>
          <Link href="/dashboard/lost" className="text-sm text-accent-purple hover:text-accent-blue transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-72 animate-shimmer" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center flex flex-col items-center">
            <Inbox size={48} className="mb-4 opacity-50 text-accent-purple" />
            <p className="text-dark-200 text-lg mb-2">No items yet</p>
            <p className="text-dark-300 text-sm mb-4">Be the first to report a lost or found item!</p>
            <Link href="/dashboard/post">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium">
                Post an Item
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentItems.map((item, i) => (
              <ItemCard key={item._id} item={item} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
