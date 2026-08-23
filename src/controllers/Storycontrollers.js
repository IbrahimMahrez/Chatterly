const asyncWrapper = require('../middlewares/catchAsync');
const { Story } = require('../models/Story');
const { User } = require('../models/User');

const getStories = asyncWrapper(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select('following');
  if (!currentUser) return res.status(404).json({ message: 'User not found' });

  // Only the user's own stories and stories from followed accounts are visible.
  const visibleAuthors = [currentUser._id, ...currentUser.following];
  const stories = await Story.find({
    author: { $in: visibleAuthors },
    expiresAt: { $gt: new Date() },
  })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });
  res.json(stories);
});

const createStory = asyncWrapper(async (req, res) => {
  if (!req.body.image) return res.status(400).json({ message: 'Story image is required' });

  const story = await Story.create({
    author: req.user._id,
    image: req.body.image,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  res.status(201).json(await story.populate('author', 'username profilePicture'));
});

const deleteStory = asyncWrapper(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ message: 'Story not found' });
  if (story.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only delete your own story' });
  }
  await story.deleteOne();
  res.json({ message: 'Story deleted successfully' });
});

module.exports = { getStories, createStory, deleteStory };
