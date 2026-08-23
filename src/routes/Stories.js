const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { getStories, createStory, deleteStory } = require('../controllers/Storycontrollers');

const router = express.Router();

router.get('/', verifyToken, getStories);
router.post('/', verifyToken, createStory);
router.delete('/:id', verifyToken, deleteStory);

module.exports = router;
