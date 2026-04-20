const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const { validateUserUpdate} = require('../utils/validation');
const bcrypt = require('bcrypt');
const { Post } = require('../models/Posts');
const asyncWrapper = require('../middlewares/catchAsync');
const createNotification = require('../utils/createNotification');


//get by id user profile

const getUserProfile = asyncWrapper(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});


//get all users (admin only)
const getAllUsers = asyncWrapper(async (req, res) => {
    const page=req.query.page || 1;
    const limit=req.query.limit || 10;
    const skip=(page-1)*limit;
    const users = await User.find().select('-password').skip(skip).limit(limit);
    res.json(users);
});

//update user profile

const updateUserProfile = asyncWrapper(async (req, res) => {

    const { error } = validateUserUpdate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🧠 update fields safely
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;

    // 🔥 password hashing
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
    }

    // 📸 profile picture update (IMPORTANT PART)
    if (req.body.profilePicture) {
        user.profilePicture = req.body.profilePicture;
    }

    const updatedUser = await user.save();

    const { password, ...userWithoutPassword } = updatedUser.toObject();

    res.json({
        message: 'User updated successfully',
        user: userWithoutPassword
    });
});

//delete user profile


const deleteUserProfile =  asyncWrapper(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({
        message: 'User deleted successfully'
    });
});
//user followers system will be implemented in the future
const followUser = asyncWrapper(async (req, res) => {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id.toString() === req.params.id) {
        return res.status(400).json({ message: "You can't follow yourself" });
    }

    const isFollowing = currentUser.following.some(
        id => id.toString() === req.params.id
    );

    if (isFollowing) {
        // 👎 Unfollow
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.id
        );

        targetUser.followers = targetUser.followers.filter(
            id => id.toString() !== req.user._id.toString()
        );

        await currentUser.save();
        await targetUser.save();
        await createNotification({
    recipient: targetUser._id,
    sender: req.user._id,
    type: 'follow'
});

        return res.json({
    message: 'User followed',
    user: {
        id: targetUser._id,
        username: targetUser.username,
        profilePicture: targetUser.profilePicture
    }
});
    }

    // 👍 Follow
    currentUser.following.push(req.params.id);
    targetUser.followers.push(req.user._id);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'User followed' });
});
//feed route will be implemented in the future
const getFeed = asyncWrapper(async (req, res) => {

    const currentUser = await User.findById(req.user._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
        author: { $in: currentUser.following }
    })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
        results: posts,
        page,
        limit
    });
});





module.exports = {
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    deleteUserProfile,
    followUser,
    getFeed
}