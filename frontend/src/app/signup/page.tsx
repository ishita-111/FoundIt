'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(form.name, form.email, form.password, form.studentId);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        
        <div className="text-center mb-8">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-strong flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Logo className="w-10 h-10" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-300">Join FoundIT and never lose track again</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 relative z-20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm text-dark-200 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-dark-200 font-medium">College Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-dark-200 font-medium">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="STU-2024-001"
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-dark-200 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all duration-200"
              />
              <p className="text-xs text-dark-400">Minimum 6 characters</p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold text-base hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-purple hover:text-accent-blue transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
