'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getItems, getMatches } from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';
import { Link as LinkIcon, SearchX, Circle } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface MatchData {
  item: {
    _id: string;
    type: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    images: string[];
    postedBy: { name: string };
  };
  score: number;
}

interface MatchGroup {
  itemId: string;
  itemTitle: string;
  itemType: string;
  matches: MatchData[];
}

export default function MatchesPage() {
  const { user, token } = useAuth();
  const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {

        const data = await getItems({}, token || undefined);
        const userItems = data.items.filter(
          (item: { postedBy: { _id: string } }) => item.postedBy._id === user?._id
        );

        const groups: MatchGroup[] = [];
        for (const item of userItems) {
          try {
            const itemMatches = await getMatches(item._id, token!);
            if (itemMatches.length > 0) {
              groups.push({
                itemId: item._id,
                itemTitle: item.title,
                itemType: item.type,
                matches: itemMatches,
              });
            }
          } catch { }
        }

        setMatchGroups(groups);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && user) fetchMatches();
  }, [token, user]);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <GradientIcon Icon={LinkIcon} size={32} /> My Matches
        </h1>
        <p className="text-dark-300">Potential matches for your reported items</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-32 animate-shimmer" />
          ))}
        </div>
      ) : matchGroups.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-12 text-center flex flex-col items-center">
          <SearchX size={48} className="mb-4 opacity-50" />
          <p className="text-dark-200 text-lg mb-2">No matches yet</p>
          <p className="text-dark-300 text-sm mb-4">
            Post a lost or found item and we&apos;ll automatically find potential matches!
          </p>
          <Link href="/dashboard/post">
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Post an Item
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {matchGroups.map((group, gi) => (
            <motion.div
              key={group.itemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                  group.itemType === 'lost'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  <Circle className={`w-2 h-2 fill-current ${group.itemType === 'lost' ? 'text-red-400' : 'text-emerald-400'}`} />
                  {group.itemType === 'lost' ? 'Lost' : 'Found'}
                </span>
                <Link href={`/dashboard/item/${group.itemId}`} className="text-white font-semibold hover:text-accent-purple transition-colors">
                  {group.itemTitle}
                </Link>
                <span className="text-dark-400 text-xs">{group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.matches.map((match, i) => (
                  <MatchCard key={match.item._id} match={match} index={i} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
