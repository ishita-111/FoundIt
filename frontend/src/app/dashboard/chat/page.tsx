'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, sendMessage } from '@/lib/api';
import ChatWindow from '@/components/ChatWindow';
import { MessageCircle } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

interface Conversation {
  user: { _id: string; name: string; email: string; studentId: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  content: string;
  createdAt: string;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ _id: string; name: string } | null>(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const itemId = searchParams.get('itemId');
  const userId = searchParams.get('userId');

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations(token!);
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoadingConvos(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (otherId: string) => {
    setLoadingMessages(true);
    try {
      const data = await getMessages(otherId, token!);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, fetchConversations]);

  useEffect(() => {
    if (userId) {
      setSelectedUser({ _id: userId, name: 'User' });
      fetchMessages(userId);
    }
  }, [userId, fetchMessages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedUser(conv.user);
    fetchMessages(conv.user._id);
  };

  const handleSend = async (content: string) => {
    if (!selectedUser || !token) return;
    try {
      const msg = await sendMessage(
        { receiver: selectedUser._id, content, item: itemId || undefined },
        token
      );
      setMessages((prev) => [...prev, msg]);
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  useEffect(() => {
    if (!selectedUser || !token) return;
    const interval = setInterval(() => fetchMessages(selectedUser._id), 5000);
    return () => clearInterval(interval);
  }, [selectedUser, token, fetchMessages]);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <GradientIcon Icon={MessageCircle} size={32} /> Messages
        </h1>
        <p className="text-dark-300">Chat with other users about items</p>
      </motion.div>

      <div className="flex gap-4 h-[calc(100%-5rem)]">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 shrink-0 glass rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 glass rounded-xl animate-shimmer" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center">
                <GradientIcon Icon={MessageCircle} size={36} className="mb-3 opacity-50" />
                <p className="text-dark-300 text-sm">No conversations yet</p>
                <p className="text-dark-400 text-xs mt-1">Contact someone from an item to start chatting</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.user._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                      selectedUser?._id === conv.user._id
                        ? 'bg-accent-purple/10 border border-accent-purple/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {conv.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium truncate">{conv.user.name}</p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-accent-purple text-white text-xs flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-dark-300 text-xs truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <ChatWindow
          messages={messages}
          otherUser={selectedUser}
          onSend={handleSend}
          loading={loadingMessages}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
