const express = require('express');
const router = express.Router();
const {verifyTokenAndAuthorization} = require('../middlewares/verifyToken');
const {verifyTokenAndAdmin,verifyToken} = require('../middlewares/verifyToken');
const { getUserProfile, getAllUsers, getDiscoverUsers, getConversations, getSavedPosts, updateUserProfile, deleteUserProfile,followUser,getFeed } = require('../controllers/Userscontollers');
const { getUserDashboard } = require('../controllers/Dashboardcontrollers');



//feed route will be implemented in the future
router.get('/feed', verifyToken, getFeed);
router.get('/discover', verifyToken, getDiscoverUsers);
router.get('/conversations', verifyToken, getConversations);
router.get('/saved', verifyToken, getSavedPosts);
router.get('/dashboard', verifyToken, getUserDashboard);



//get by id user profile (any authenticated user)
router.get('/:id', verifyToken, getUserProfile);

//get all users (admin only)
router.get('/', verifyTokenAndAdmin, getAllUsers);

//update user profile
router.put('/:id', verifyTokenAndAuthorization, updateUserProfile);

//delete user profile
router.delete('/:id',verifyTokenAndAuthorization, deleteUserProfile);
//user followers system will be implemented in the future
router.post('/:id/follow', verifyToken, followUser);





module.exports = router;

