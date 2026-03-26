const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post(
  '/',
  auth,
  upload.array('images', 4),
  [
    body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, title, description, category, location, date } = req.body;

      const images = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      const item = await Item.create({
        type,
        title,
        description,
        category,
        location,
        date,
        images,
        postedBy: req.user._id,
      });

      await item.populate('postedBy', 'name email studentId');

      res.status(201).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const { type, category, location, search, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;
    else filter.status = 'active';

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('postedBy', 'name email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email studentId');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, upload.array('images', 4), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email studentId');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/matches', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    const dateRange = new Date(item.date);
    const minDate = new Date(dateRange);
    minDate.setDate(minDate.getDate() - 7);
    const maxDate = new Date(dateRange);
    maxDate.setDate(maxDate.getDate() + 7);

    const candidates = await Item.find({
      type: oppositeType,
      status: 'active',
      _id: { $ne: item._id },
      $or: [
        { category: item.category },
        { location: { $regex: item.location.split(' ')[0], $options: 'i' } },
      ],
      date: { $gte: minDate, $lte: maxDate },
    })
      .populate('postedBy', 'name email studentId')
      .limit(10);

    const scored = candidates.map((candidate) => {
      let score = 0;

      if (candidate.category === item.category) score += 40;

      if (candidate.location.toLowerCase() === item.location.toLowerCase()) score += 30;
      else if (candidate.location.toLowerCase().includes(item.location.split(' ')[0].toLowerCase())) score += 15;

      const daysDiff = Math.abs(
        (new Date(candidate.date) - new Date(item.date)) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 20 - daysDiff * 3);

      const itemWords = new Set(
        `${item.title} ${item.description}`.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      );
      const candWords = `${candidate.title} ${candidate.description}`.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const overlap = candWords.filter((w) => itemWords.has(w)).length;
      score += Math.min(overlap * 5, 20);

      return { item: candidate, score: Math.round(score) };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json(scored.filter((s) => s.score > 10));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
