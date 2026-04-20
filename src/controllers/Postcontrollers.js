const express = require('express');
const router = express.Router();
const {Post} = require('../models/Posts');
const asyncWrapper = require('../middlewares/catchAsync');
const {verifyToken}  = require('../middlewares/verifyToken');
const createNotification = require('../utils/createNotification');


//get all posts


const getAllPosts =  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip=(page-1)*limit;
    const posts = await Post.find().populate('author', 'username').skip(skip).limit(limit);
    res.json(posts);
});

//get a post by id
const getPostById = asyncWrapper(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
});

//create a post
const createPost = asyncWrapper(async (req, res) => {
  const post = new Post({
    content: req.body.content,
    author: req.user._id
  });

  const savedPost = await post.save();
  res.status(201).json(savedPost);
})

//update a post

const updatePost = asyncWrapper(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not allowed to update this post' });
    }
    post.content = req.body.content || post.content;
    const updatedPost = await post.save();
    res.json(updatedPost);
}
);

//delete a post
const  deletePost =  asyncWrapper(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not allowed to delete this post' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
});

//like or unlike a post
const likeUnlikePost = asyncWrapper(async (req, res) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();

    const isLiked = post.likes.some(
        id => id.toString() === userId
    );

    if (isLiked) {
        // 👎 Unlike
        post.likes = post.likes.filter(
            id => id.toString() !== userId
        );

        await post.save();

        return res.json({
            message: 'Post unliked',
            likesCount: post.likes.length
        });
    }

    // 👍 Like
    post.likes.push(req.user._id);
    await post.save();

    // 🔥 Create Notification (only when liking)
    await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id
    });

    res.json({
        message: 'Post liked',
        likesCount: post.likes.length
    });
});

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likeUnlikePost
};