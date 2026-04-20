const express = require('express');
const router = express.Router();
const {Comment} = require('../models/Comments');
const asyncWrapper = require('../middlewares/catchAsync');
const {verifyToken}  = require('../middlewares/verifyToken');
const { createComment, getCommentsForPost, deleteComment, likeUnlikeComment } = require('../controllers/Commentscontrollers');

//create a comment
router.post('/posts/:postId/comments', verifyToken, createComment);

//get comments for a post
router.get('/posts/:postId/comments', verifyToken, getCommentsForPost);

//delete a comment
router.delete('/:id', verifyToken, deleteComment);

//like or unlike a comment
router.post('/:id/like', verifyToken, likeUnlikeComment);




module.exports = router;
