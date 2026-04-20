const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const { validateUserUpdate} = require('../utils/validation');
const { Post } = require('../models/Posts');
const bcrypt = require('bcrypt');
const asyncWrapper = require('../middlewares/catchAsync');
const {verifyTokenAndAuthorization} = require('../middlewares/verifyToken');
const {verifyTokenAndAdmin,verifyToken} = require('../middlewares/verifyToken');
const { getUserProfile, getAllUsers, updateUserProfile, deleteUserProfile,followUser,getFeed } = require('../controllers/Userscontollers');



//feed route will be implemented in the future
router.get('/feed', verifyToken, getFeed);



//get by id user profile
router.get('/:id', verifyTokenAndAuthorization, getUserProfile);

//get all users (admin only)
router.get('/', verifyTokenAndAdmin, getAllUsers);

//update user profile
router.put('/:id', verifyTokenAndAuthorization, updateUserProfile);

//delete user profile
router.delete('/:id',verifyTokenAndAuthorization, deleteUserProfile);
//user followers system will be implemented in the future
router.post('/:id/follow', verifyToken, followUser);





module.exports = router;

