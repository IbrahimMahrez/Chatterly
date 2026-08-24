const asyncWrapper = require('../middlewares/catchAsync');
const { Message } = require('../models/Message');
const { SavedMessage } = require('../models/SavedMessage');

const toggleSavedMessage = asyncWrapper(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  const existing = await SavedMessage.findOne({ user: req.user._id, message: message._id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ saved: false });
  }

  await SavedMessage.create({ user: req.user._id, message: message._id });
  res.status(201).json({ saved: true });
});

const getSavedMessages = asyncWrapper(async (req, res) => {
  const savedMessages = await SavedMessage.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'message', populate: { path: 'sender', select: 'username profilePicture' } })
    .lean();

  res.json(savedMessages.filter((item) => item.message));
});

const searchMessages = asyncWrapper(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) return res.json([]);
  if (query.length > 100) return res.status(400).json({ message: 'Search query is too long' });

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const userId = String(req.user._id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const messages = await Message.find({
    message: { $regex: escapedQuery, $options: 'i' },
    $or: [
      { roomId: { $not: /^dm_/ } },
      { roomId: { $regex: userId } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  res.json(messages);
});

module.exports = { toggleSavedMessage, getSavedMessages, searchMessages };
