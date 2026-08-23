const asyncWrapper = require('../middlewares/catchAsync');
const { User } = require('../models/User');
const { Post } = require('../models/Posts');
const { Comment } = require('../models/Comments');
const { Message } = require('../models/Message');
const { Notification } = require('../models/Notification');

const getUserDashboard = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [posts, comments, messages, notifications, recentPosts] = await Promise.all([
    Post.find({ author: user._id }).select('likes').lean(),
    Comment.countDocuments({ author: user._id }),
    Message.countDocuments({ sender: user._id }),
    Notification.countDocuments({ recipient: user._id, isRead: false }),
    Post.find({ author: user._id }).populate('author', 'username profilePicture').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    user,
    stats: {
      posts: posts.length,
      likesReceived: posts.reduce((total, post) => total + post.likes.length, 0),
      comments,
      messages,
      unreadNotifications: notifications,
      savedPosts: await Post.countDocuments({ savedBy: user._id }),
      followers: user.followers.length,
      following: user.following.length,
    },
    recentPosts,
  });
});

module.exports = { getUserDashboard };
