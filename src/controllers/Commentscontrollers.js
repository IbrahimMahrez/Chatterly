const express = require('express');
const router = express.Router();
const {Comment} = require('../models/Comments');
const asyncWrapper = require('../middlewares/catchAsync');
const {verifyToken}  = require('../middlewares/verifyToken');



//create a comment

const createComment =  asyncWrapper(async (req, res) => {
    const comment = new Comment({
        content: req.body.content,
        author: req.user._id,
        post: req.params.postId
    });
    if (!req.body.content) {
  return res.status(400).json({ message: "Content is required" });
}

    await comment.save();
    res.status(201).json(comment);
});

//get comments for a post

const getCommentsForPost = asyncWrapper(async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId }).populate('author', 'username').sort({ createdAt: -1 });
    res.json(comments);
});

//delete a comment
const deleteComment =  asyncWrapper(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });    
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
});

//like or unlike a comment 
const likeUnlikeComment = asyncWrapper(async (req, res) => {

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user._id.toString();

    const isLiked = comment.likes.some(id => id.toString() === userId);

    if (isLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
        comment.likes.push(userId);
    }

    await comment.save();

    res.json({
        liked: !isLiked,
        likesCount: comment.likes.length
    });
});

module.exports = {
    createComment,
    getCommentsForPost,
    deleteComment,
    likeUnlikeComment
};