'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUnreadCount } from '@/lib/api';

import { LayoutDashboard, Search, Package, PlusSquare, Link as LinkIcon, MessageCircle, User as UserIcon } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';
import Logo from '@/components/Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lost', label: 'Lost Items', icon: Search },
  { href: '/dashboard/found', label: 'Found Items', icon: Package },
  { href: '/dashboard/post', label: 'Post Item', icon: PlusSquare },
  { href: '/dashboard/matches', label: 'Matches', icon: LinkIcon },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await getUnreadCount(token);
        setUnreadCount(res.count);
      } catch (err) {
        // silently fail polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-white hover:bg-dark-600 transition-colors"
        aria-label="Toggle navigation"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:static z-40 top-0 left-0 h-screen glass-strong flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <Logo className="w-10 h-10 shrink-0 drop-shadow-lg" />
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-bold gradient-text">FoundIT</h1>
              <p className="text-xs text-dark-200">Lost it? FoundIT.</p>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-600 border border-white/10 items-center justify-center text-xs text-dark-200 hover:text-white transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-purple/20 to-accent-blue/10 text-white'
                    : 'text-dark-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-accent-purple to-accent-blue rounded-full"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <div className="relative shrink-0 flex items-center justify-center">
                  <GradientIcon Icon={item.icon} size={22} />
                  {item.href === '/dashboard/chat' && unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/30"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                  )}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-dark-200 truncate">{user?.studentId}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              className="mt-3 w-full px-3 py-2 rounded-lg text-xs text-dark-200 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left"
            >
              Sign Out
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
