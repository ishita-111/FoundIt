const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('receiver').notEmpty().withMessage('Receiver is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { receiver, content, item } = req.body;

      const senderUser = await User.findById(req.user._id);
      const receiverUser = await User.findById(receiver);

      if (senderUser.blockedUsers && senderUser.blockedUsers.includes(receiver)) {
        return res.status(403).json({ message: 'You have blocked this user' });
      }
      if (receiverUser.blockedUsers && receiverUser.blockedUsers.includes(req.user._id)) {
        return res.status(403).json({ message: 'Cannot send message to this user' });
      }

      const message = await Message.create({
        sender: req.user._id,
        receiver,
        content,
        item: item || null,
      });

      await message.populate('sender', 'name email');
      await message.populate('receiver', 'name email');

      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const blockedIds = user.blockedUsers || [];

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          sender: { $nin: blockedIds },
          receiver: { $nin: blockedIds },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
          },
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
          item: { $first: '$item' },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
    ]);

    const populated = await User.populate(messages, { path: '_id', select: 'name email studentId' });

    const conversations = populated.map((conv) => ({
      user: conv._id,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadCount,
      item: conv.item,
    }));

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread/count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const blockedIds = user.blockedUsers || [];
    
    const count = await Message.countDocuments({ 
      receiver: req.user._id, 
      read: false,
      sender: { $nin: blockedIds }
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/conversation/:userId', auth, async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('item', 'title type')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
