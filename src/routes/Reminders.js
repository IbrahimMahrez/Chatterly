const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { listReminders, createReminder, completeReminder, deleteReminder } = require('../controllers/Remindercontrollers');

const router = express.Router();

router.use(verifyToken);
router.route('/').get(listReminders).post(createReminder);
router.patch('/:id', completeReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
