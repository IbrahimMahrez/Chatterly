const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { chat, suggestPost, summarizeConversation, suggestReplies } = require('../controllers/AIcontrollers');

const router = express.Router();

router.post('/chat', verifyToken, chat);
router.post('/suggest-post', verifyToken, suggestPost);
router.post('/summarize-conversation', verifyToken, summarizeConversation);
router.post('/suggest-replies', verifyToken, suggestReplies);

module.exports = router;
