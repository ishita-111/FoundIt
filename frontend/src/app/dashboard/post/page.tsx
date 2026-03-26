'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createItem } from '@/lib/api';
import { Smartphone, Book, Shirt, Watch, CreditCard, Key, Briefcase, Dumbbell, Pencil, Pin, Search, Package, MapPin, ClipboardList, Circle, Send, Plus, Check, LucideIcon } from 'lucide-react';
import GradientIcon from '@/components/GradientIcon';

const categories = [
  'Electronics', 'Books & Notes', 'Clothing', 'Accessories',
  'ID & Cards', 'Keys', 'Bags & Wallets', 'Sports Equipment',
  'Stationery', 'Other',
];

const locations = [
  'Library', 'Cafeteria', 'Computer Lab', 'Main Building',
  'Sports Complex', 'Auditorium', 'Parking Lot', 'Hostel',
  'Classroom', 'Lab', 'Other',
];

const categoryIcons: Record<string, LucideIcon> = {
  'Electronics': Smartphone, 'Books & Notes': Book, 'Clothing': Shirt,
  'Accessories': Watch, 'ID & Cards': CreditCard, 'Keys': Key,
  'Bags & Wallets': Briefcase, 'Sports Equipment': Dumbbell, 'Stationery': Pencil, 'Other': Pin,
};

export default function PostItemPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: '' as 'lost' | 'found' | '',
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.type !== '';
      case 2: return form.title && form.description && form.category;
      case 3: return form.location && form.date;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('location', form.location);
      formData.append('date', form.date);
      images.forEach((img) => formData.append('images', img));

      await createItem(formData, token!);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = ['Type', 'Details', 'Location & Date', 'Images & Review'];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <GradientIcon Icon={Plus} size={32} /> Report an Item
        </h1>
        <p className="text-dark-300">Fill in the details to post a lost or found item</p>
      </motion.div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stepTitles.map((title, i) => (
            <div key={title} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step > i + 1 ? 'bg-accent-purple text-white' :
                step === i + 1 ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white glow-purple' :
                'bg-dark-600 text-dark-300'
              }`}>
                {step > i + 1 ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white' : 'text-dark-400'}`}>
                {title}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full"
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <div className="glass-strong rounded-2xl p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-semibold text-white mb-6">What happened?</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'lost' as const, label: 'I Lost Something', icon: Search, desc: 'Report an item you\'ve lost', color: 'from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-red-500/20' },
                  { type: 'found' as const, label: 'I Found Something', icon: Package, desc: 'Report an item you\'ve found', color: 'from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-500/20' },
                ].map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setForm({ ...form, type: option.type })}
                    className={`p-6 rounded-2xl border text-left transition-all duration-200 bg-gradient-to-br ${option.color} ${
                      form.type === option.type ? 'ring-2 ring-accent-purple/50' : ''
                    }`}
                  >
                    <div className="mb-4">
                      <GradientIcon Icon={option.icon} size={40} />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                    <p className="text-dark-300 text-xs">{option.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-semibold text-white mb-6">Item Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-200 font-medium">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Black iPhone 15 with cracked screen"
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-200 font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the item in detail — color, size, distinguishing features..."
                    rows={4}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 placeholder-dark-400 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-200 font-medium mb-2 block">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                          form.category === cat
                            ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                            : 'bg-dark-700/50 text-dark-200 border border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <GradientIcon Icon={categoryIcons[cat] || Pin} size={16} /> {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-semibold text-white mb-6">Location & Date</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-200 font-medium mb-2 block">Location</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setForm({ ...form, location: loc })}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                          form.location === loc
                            ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                            : 'bg-dark-700/50 text-dark-200 border border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <MapPin size={14} className="opacity-70" /> {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-200 font-medium">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-dark-700/50 text-white border border-white/5 focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-semibold text-white mb-6">Images & Review</h2>

              <div className="mb-6">
                <label className="text-sm text-dark-200 font-medium mb-2 block">Images (optional, max 4)</label>
                <div className="grid grid-cols-4 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-dark-700">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-dark-500 flex items-center justify-center cursor-pointer hover:border-accent-purple/50 transition-colors">
                      <span className="text-dark-400 text-2xl">+</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="glass rounded-xl p-4 space-y-2">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ClipboardList size={18} className="text-accent-purple" /> Review Summary
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-dark-400">Type:</span> <span className="text-white capitalize">{form.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span></div>
                  <div><span className="text-dark-400">Category:</span> <span className="text-white">{form.category}</span></div>
                  <div><span className="text-dark-400">Location:</span> <span className="text-white">{form.location}</span></div>
                  <div><span className="text-dark-400">Date:</span> <span className="text-white">{form.date}</span></div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-dark-400 text-sm">Title</p>
                  <p className="text-white">{form.title}</p>
                </div>
                <div>
                  <p className="text-dark-400 text-sm">Description</p>
                  <p className="text-dark-200 text-sm">{form.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-xl text-dark-200 hover:text-white text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-purple"
            >
              {submitting ? 'Posting...' : <span className="flex items-center justify-center gap-2"><Send size={16} /> Post Item</span>}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
