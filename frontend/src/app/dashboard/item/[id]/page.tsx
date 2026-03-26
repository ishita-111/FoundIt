'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getItem, getMatches, deleteItem } from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';
import { AlertCircle, Circle, CheckCircle2, MapPin, Calendar, User as UserIcon, Clock, MessageCircle, Trash2, Link as LinkIcon, SearchX } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface ItemData {
  _id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  images: string[];
  status: string;
  postedBy: { _id: string; name: string; email: string; studentId: string };
  createdAt: string;
}

interface MatchData {
  item: ItemData;
  score: number;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [item, setItem] = useState<ItemData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = params.id as string;
        const itemData = await getItem(id, token || undefined);
        setItem(itemData);

        if (token) {
          try {
            const matchData = await getMatches(id, token);
            setMatches(matchData);
          } catch { }
        }
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, token]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeleting(true);
    try {
      await deleteItem(item!._id, token!);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl h-96 animate-shimmer" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <GradientIcon Icon={AlertCircle} size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-dark-200 text-lg mt-4">Item not found</p>
        <Link href="/dashboard" className="text-accent-purple text-sm mt-2 block">← Back to Dashboard</Link>
      </div>
    );
  }

  const isOwner = user?._id === item.postedBy._id;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => router.back()} className="text-dark-300 hover:text-white text-sm transition-colors flex items-center gap-1">
          ← Back
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <div className="glass-strong rounded-2xl overflow-hidden">
            
            {item.images.length > 0 && (
              <div className="relative">
                <div className="aspect-video bg-dark-700 overflow-hidden">
                  <img
                    src={`${apiBase}${item.images[activeImage]}`}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                {item.images.length > 1 && (
                  <div className="flex gap-2 p-3 bg-dark-800/50">
                    {item.images.map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === i ? 'border-accent-purple' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={`${apiBase}${img}`} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-semibold ${
                  item.type === 'lost'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  <Circle className={`w-2.5 h-2.5 fill-current ${item.type === 'lost' ? 'text-red-400' : 'text-emerald-400'}`} />
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-600 text-dark-200">
                  {item.category}
                </span>
                {item.status === 'resolved' && (
                  <span className="px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-medium bg-accent-purple/20 text-accent-purple">
                    <CheckCircle2 size={14} /> Resolved
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white mb-3">{item.title}</h1>
              <p className="text-dark-200 mb-6 leading-relaxed">{item.description}</p>

              <div className="grid grid-cols-2 gap-4 p-4 glass rounded-xl">
                <div>
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1.5"><MapPin size={12} className="opacity-70" /> Location</p>
                  <p className="text-white text-sm font-medium">{item.location}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1.5"><Calendar size={12} className="opacity-70" /> Date</p>
                  <p className="text-white text-sm font-medium">{new Date(item.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1.5"><UserIcon size={12} className="opacity-70" /> Posted by</p>
                  <p className="text-white text-sm font-medium">{item.postedBy.name}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1.5"><Clock size={12} className="opacity-70" /> Posted</p>
                  <p className="text-white text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {!isOwner && (
                  <Link href={`/dashboard/chat?userId=${item.postedBy._id}&itemId=${item._id}`}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <MessageCircle size={16} /> Contact {item.postedBy.name}
                    </motion.button>
                  </Link>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting ? 'Deleting...' : <><Trash2 size={16} /> Delete</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="sticky top-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <GradientIcon Icon={LinkIcon} size={20} /> Potential Matches
            </h3>
            {matches.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center flex flex-col items-center">
                <SearchX size={32} className="mb-3 opacity-50" />
                <p className="text-dark-300 text-sm">No matches found yet</p>
                <p className="text-dark-400 text-xs mt-1">Matches appear when similar items are posted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match, i) => (
                  <MatchCard key={match.item._id} match={match} index={i} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
