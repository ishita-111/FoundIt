const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Item type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 1000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics',
      'Books & Notes',
      'Clothing',
      'Accessories',
      'ID & Cards',
      'Keys',
      'Bags & Wallets',
      'Sports Equipment',
      'Stationery',
      'Other',
    ],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  images: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ date: -1 });
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
