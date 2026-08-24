const asyncWrapper = require('../middlewares/catchAsync');
const { Circle } = require('../models/Circle');

const serializeCircle = (circle, userId) => {
  const item = circle.toObject ? circle.toObject() : circle;
  const memberIds = (item.members || []).map(String);
  return {
    ...item,
    isMember: memberIds.includes(String(userId)),
    membersCount: memberIds.length,
    roomId: `circle_${item._id}`,
  };
};

const listCircles = asyncWrapper(async (req, res) => {
  const circles = await Circle.find({ endsAt: { $gt: new Date() } })
    .populate('owner', 'username')
    .populate('members', 'username')
    .sort({ createdAt: -1 })
    .limit(60);
  res.json(circles.map((circle) => serializeCircle(circle, req.user._id)));
});

const createCircle = asyncWrapper(async (req, res) => {
  const { title, goal, days, maxMembers } = req.body;
  const duration = Number(days);
  const limit = Number(maxMembers);
  if (!title?.trim() || !goal?.trim() || !Number.isInteger(duration) || duration < 1 || duration > 30 || !Number.isInteger(limit) || limit < 3 || limit > 8) {
    return res.status(400).json({ message: 'Please enter a title, goal, duration (1–30 days), and 3–8 members.' });
  }
  const endsAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
  const circle = await Circle.create({ title: title.trim(), goal: goal.trim(), owner: req.user._id, members: [req.user._id], maxMembers: limit, endsAt });
  await circle.populate('owner', 'username');
  res.status(201).json(serializeCircle(circle, req.user._id));
});

const joinCircle = asyncWrapper(async (req, res) => {
  const circle = await Circle.findOne({ _id: req.params.id, endsAt: { $gt: new Date() } });
  if (!circle) return res.status(404).json({ message: 'This circle is no longer available.' });
  if (!circle.members.some((id) => String(id) === String(req.user._id))) {
    if (circle.members.length >= circle.maxMembers) return res.status(409).json({ message: 'This circle is full.' });
    circle.members.push(req.user._id);
    await circle.save();
  }
  await circle.populate('owner', 'username');
  await circle.populate('members', 'username');
  res.json(serializeCircle(circle, req.user._id));
});

const addCheckIn = asyncWrapper(async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ message: 'Write a short update first.' });
  const circle = await Circle.findOne({ _id: req.params.id, members: req.user._id, endsAt: { $gt: new Date() } });
  if (!circle) return res.status(404).json({ message: 'Join this active circle first.' });
  const dateKey = new Date().toISOString().slice(0, 10);
  const existing = circle.checkIns.find((item) => String(item.user) === String(req.user._id) && item.dateKey === dateKey);
  if (existing) { existing.text = text.slice(0, 500); } else { circle.checkIns.push({ user: req.user._id, text: text.slice(0, 500), dateKey }); }
  await circle.save();
  await circle.populate('owner', 'username');
  await circle.populate('members', 'username');
  res.json(serializeCircle(circle, req.user._id));
});

module.exports = { listCircles, createCircle, joinCircle, addCheckIn };
