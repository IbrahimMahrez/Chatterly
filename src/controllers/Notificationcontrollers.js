const asyncWrapper = require('../middlewares/catchAsync');
const { Notification } = require('../models/Notification');

const getNotifications = asyncWrapper(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username')
    .populate('post', 'content')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
});

const markAsRead = asyncWrapper(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.isRead = true;
  await notification.save();
  res.json({ message: 'Marked as read' });
});

const markAllAsRead = asyncWrapper(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ message: 'All marked as read' });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
