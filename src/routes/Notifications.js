const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/Notificationcontrollers');

router.get('/', verifyToken, getNotifications);
router.put('/read-all', verifyToken, markAllAsRead);
router.put('/:id/read', verifyToken, markAsRead);

module.exports = router;
