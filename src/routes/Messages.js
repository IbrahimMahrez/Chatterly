const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { getSavedMessages, toggleSavedMessage, searchMessages } = require('../controllers/Messagecontrollers');

const router = express.Router();

router.get('/saved', verifyToken, getSavedMessages);
router.get('/search', verifyToken, searchMessages);
router.post('/:id/save', verifyToken, toggleSavedMessage);

module.exports = router;
