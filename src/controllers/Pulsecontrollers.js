const asyncWrapper = require('../middlewares/catchAsync');
const { PulseSession } = require('../models/PulseSession');
const { User } = require('../models/User');

const allowed = {
  mood: ['happy', 'stressed', 'talk', 'focused'],
  topic: ['work', 'study', 'relationships', 'football', 'technology'],
  privacy: ['known', 'anonymous'],
};

const joinPulse = asyncWrapper(async (req, res) => {
  const { mood, topic, privacy } = req.body;
  if (!allowed.mood.includes(mood) || !allowed.topic.includes(topic) || !allowed.privacy.includes(privacy)) return res.status(400).json({ message: 'Invalid pulse choices.' });
  const userId = req.user._id;
  const criteria = { mood, topic, privacy, closed: false, expiresAt: { $gt: new Date() }, $expr: { $lt: [{ $size: '$members' }, 8] } };
  if (privacy === 'known') {
    const user = await User.findById(userId).select('following').lean();
    const following = user?.following || [];
    criteria.$and = [{ members: { $ne: userId } }, { members: { $in: following } }];
  } else {
    criteria.members = { $ne: userId };
  }
  let session = await PulseSession.findOne(criteria).sort({ createdAt: 1 });
  if (!session) {
    const expiresAt = new Date();
    expiresAt.setHours(24, 0, 0, 0);
    if (expiresAt <= new Date()) expiresAt.setDate(expiresAt.getDate() + 1);
    session = await PulseSession.create({ mood, topic, privacy, members: [userId], expiresAt });
  } else {
    session.members.push(userId);
    await session.save();
  }
  res.json({ _id: session._id, roomId: `pulse_${session._id}`, mood: session.mood, topic: session.topic, privacy: session.privacy, membersCount: session.members.length, expiresAt: session.expiresAt });
});

const getPulse = asyncWrapper(async (req, res) => {
  const session = await PulseSession.findOne({ _id: req.params.id, members: req.user._id, closed: false, expiresAt: { $gt: new Date() } });
  if (!session) return res.status(404).json({ message: 'This daily pulse is no longer available.' });
  res.json({ _id: session._id, roomId: `pulse_${session._id}`, mood: session.mood, topic: session.topic, privacy: session.privacy, membersCount: session.members.length, expiresAt: session.expiresAt });
});

module.exports = { joinPulse, getPulse };
