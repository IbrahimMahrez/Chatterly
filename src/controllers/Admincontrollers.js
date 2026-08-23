const asyncWrapper = require('../middlewares/catchAsync');
const { User } = require('../models/User');
const { Post } = require('../models/Posts');
const { Comment } = require('../models/Comments');
const { Message } = require('../models/Message');
const { Story } = require('../models/Story');

const getAdminDashboard = asyncWrapper(async (req, res) => {
  const [users, posts, comments, messages, stories, latestUsers, latestPosts] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments(),
    Message.countDocuments(),
    Story.countDocuments({ expiresAt: { $gt: new Date() } }),
    User.find().select('username email profilePicture isAdmin createdAt').sort({ createdAt: -1 }).limit(8).lean(),
    Post.find().populate('author', 'username profilePicture').sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  res.json({ stats: { users, posts, comments, messages, stories }, latestUsers, latestPosts });
});

module.exports = { getAdminDashboard };
