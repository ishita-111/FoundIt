'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link as LinkIcon, Package, Search, Circle, MapPin, Calendar } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface MatchCardProps {
  match: {
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
  };
  originalItem?: {
    title: string;
    type: string;
  };
  index?: number;
}

export default function MatchCard({ match, originalItem, index = 0 }: MatchCardProps) {
  const { item, score } = match;
  const imageUrl = item.images?.[0]
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.images[0]}`
    : null;

  const scoreColor =
    score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-dark-200 bg-dark-500/30 border-dark-400/30';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <div className="glass rounded-2xl overflow-hidden hover:border-accent-purple/30 transition-all duration-300 group">
        <div className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GradientIcon Icon={LinkIcon} size={18} />
              <span className="text-xs text-dark-300">Potential Match</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreColor}`}>
              {score}% match
            </span>
          </div>

          <div className="flex gap-4">
            
            <div className="w-20 h-20 rounded-xl bg-dark-700 overflow-hidden shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <GradientIcon Icon={item.type === 'found' ? Package : Search} size={32} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium mb-1 ${
                item.type === 'found'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                <Circle className={`w-2 h-2 fill-current ${item.type === 'found' ? 'text-emerald-400' : 'text-red-400'}`} />
                {item.type === 'found' ? 'Found' : 'Lost'}
              </div>
              <h4 className="text-white font-semibold truncate group-hover:text-accent-purple transition-colors">
                {item.title}
              </h4>
              <p className="text-dark-300 text-xs mt-1 line-clamp-1">{item.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-dark-300">
                <span className="flex items-center gap-1.5"><MapPin size={12} className="opacity-70" /> {item.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="opacity-70" /> {new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-dark-300">by {item.postedBy?.name}</span>
            <Link
              href={`/dashboard/item/${item._id}`}
              className="text-xs text-accent-purple hover:text-accent-blue transition-colors font-medium"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
