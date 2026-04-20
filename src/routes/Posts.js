const express = require('express');
const router = express.Router();
const {Post} = require('../models/Posts');
const asyncWrapper = require('../middlewares/catchAsync');
const {verifyToken}  = require('../middlewares/verifyToken');
const { getAllPosts, getPostById, createPost, updatePost, deletePost, likeUnlikePost} = require('../controllers/Postcontrollers');



//get all posts
router.get('/', verifyToken, getAllPosts);

//get a post by id
router.get('/:id', verifyToken, getPostById);
//create a post
router.post('/', verifyToken, createPost);
//update a post
router.put('/:id', verifyToken, updatePost);
//delete a post
router.delete('/:id', verifyToken, deletePost);
//like or unlike a post
router.post('/:id/like', verifyToken, likeUnlikePost);









module.exports = router;