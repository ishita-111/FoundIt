'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Send as SendIcon, MoreVertical, Trash2, Ban } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';
import { deleteConversation, blockUser } from '@/lib/api';
import { AnimatePresence } from 'framer-motion';

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  messages: Message[];
  otherUser: { _id: string; name: string } | null;
  onSend: (content: string) => void;
  loading?: boolean;
}

export default function ChatWindow({ messages, otherUser, onSend, loading }: ChatWindowProps) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleDeleteChat = async () => {
    if (!otherUser) return;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await deleteConversation(otherUser._id, token);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleBlockUser = async () => {
    if (!otherUser) return;
    if (window.confirm('Are you sure you want to block this user? They will not be able to message you.')) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await blockUser(otherUser._id, token);
          window.location.reload();
        }
      } catch (err) {
        console.error('Failed to block user:', err);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center glass rounded-2xl">
        <div className="text-center flex flex-col items-center">
          <GradientIcon Icon={MessageCircle} size={48} className="mb-4 opacity-50" />
          <p className="text-dark-200 text-lg">Select a conversation</p>
          <p className="text-dark-300 text-sm mt-1">Choose a chat from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
      
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white font-semibold">
            {otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold">{otherUser.name}</h3>
            <p className="text-xs text-dark-300">Active now</p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl hover:bg-white/5 text-dark-200 hover:text-white transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-dark-700/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <button
                  onClick={handleDeleteChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-100 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                  Delete Chat
                </button>
                <button
                  onClick={handleBlockUser}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-100 hover:bg-white/5 border-t border-white/5 hover:text-red-400 text-red-400 transition-colors"
                >
                  <Ban size={16} />
                  Block User
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-dark-300 text-sm h-full">
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender._id === user?._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white rounded-br-sm'
                      : 'bg-dark-600 text-dark-100 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-white/50' : 'text-dark-300'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl bg-dark-700 text-white placeholder-dark-300 border border-white/5 focus:border-accent-purple/50 transition-colors"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center justify-center gap-2"><SendIcon size={16} /> Send</span>
        </motion.button>
      </form>
    </div>
  );
}
