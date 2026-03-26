'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smartphone, Book, Shirt, Watch, CreditCard, Key, Briefcase, Dumbbell, Pencil, Pin, MapPin, Calendar, CheckCircle2, Circle, LucideIcon } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface ItemCardProps {
  item: {
    _id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    images: string[];
    status: string;
    postedBy: {
      name: string;
      studentId: string;
    };
    createdAt: string;
  };
  index?: number;
}

const categoryIcons: Record<string, LucideIcon> = {
  'Electronics': Smartphone,
  'Books & Notes': Book,
  'Clothing': Shirt,
  'Accessories': Watch,
  'ID & Cards': CreditCard,
  'Keys': Key,
  'Sports Equipment': Dumbbell,
  'Other': Pin,
};

export default function ItemCard({ item, index = 0 }: ItemCardProps) {
  const imageUrl = item.images?.[0]
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.images[0]}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link href={`/dashboard/item/${item._id}`} className="block">
        <div className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-accent-purple/30 transition-all duration-300">
          
          <div className="relative h-48 bg-dark-700 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <GradientIcon Icon={categoryIcons[item.category] || Pin} size={64} />
              </div>
            )}

            <div
              className={`absolute top-3 left-3 px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                item.type === 'lost'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Circle className={`w-2.5 h-2.5 fill-current ${item.type === 'lost' ? 'text-red-400' : 'text-emerald-400'}`} />
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </div>

            {item.status === 'resolved' && (
              <div className="absolute top-3 right-3 px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-semibold bg-accent-purple/20 text-accent-purple border border-accent-purple/30 backdrop-blur-md">
                <CheckCircle2 size={12} /> Resolved
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-white font-semibold text-lg mb-1 truncate group-hover:text-accent-purple transition-colors">
              {item.title}
            </h3>
            <p className="text-dark-200 text-sm mb-3 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-4 text-xs text-dark-300">
              <span className="flex items-center gap-1.5">
                <GradientIcon Icon={categoryIcons[item.category] || Pin} size={14} /> {item.category}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="opacity-70" /> {item.location}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-dark-300 flex items-center gap-1.5">
                <Calendar size={14} className="opacity-70" /> {new Date(item.date).toLocaleDateString()}
              </span>
              <span className="text-xs text-dark-300">
                by {item.postedBy?.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
