'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, Link as LinkIcon, MessageCircle } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';
import Logo from '@/components/Logo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-2xl"
      >
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', delay: 0.2 }}
          className="mx-auto mb-8 flex items-center justify-center drop-shadow-2xl"
        >
          <Logo className="w-24 h-24" />
        </motion.div>

        <h1 className="text-6xl font-extrabold mb-4">
          <span className="gradient-text">FoundIT</span>
        </h1>
        <p className="text-xl text-dark-200 mb-2 font-light">
          Lost it? <span className="text-white font-medium">FoundIT.</span>
        </p>
        <p className="text-dark-300 mb-10 max-w-md mx-auto">
          A modern campus-exclusive lost and found platform. Report, discover, and recover your belongings — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold text-lg hover:opacity-90 transition-opacity glow-purple"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Search, title: 'Smart Search', desc: 'Find items instantly with intelligent filters' },
            { icon: LinkIcon, title: 'Auto Matching', desc: 'AI-powered matching connects lost & found' },
            { icon: MessageCircle, title: 'Secure Chat', desc: 'Communicate safely within the platform' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="flex justify-center mb-4 mt-2">
                <GradientIcon Icon={feature.icon} size={32} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-dark-300 text-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
