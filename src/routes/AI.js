const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { chat, suggestPost } = require('../controllers/AIcontrollers');

const router = express.Router();

router.post('/chat', verifyToken, chat);
router.post('/suggest-post', verifyToken, suggestPost);

module.exports = router;
