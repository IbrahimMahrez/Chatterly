const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const { validateUserRegistration, validateUserLogin } = require('../utils/validation');
const bcrypt = require('bcrypt');
const asyncWrapper = require('../middlewares/catchAsync');



const registerUser = asyncWrapper(async (req, res) => {
   const {error}= validateUserRegistration(req.body);

   if(error) return res.status(400).json({message:error.details[0].message});
   let user=await User.findOne({email:req.body.email});
   if(user) return res.status(400).json({message:'User already registered with this email'});
   const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);

    user=new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword,
        profilePicture:req.body.profilePicture
    })
    const result =await user.save();
    const token =user.generateAuthToken();
   
    const {password,...userWithoutPassword}= result.toObject();
    res.status(201).json({
        message:'User registered successfully',
        user:userWithoutPassword,
        token:token
    });

});

const loginUser = asyncWrapper(async (req, res) => {
    const { error } = validateUserLogin(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });
    const token = user.generateAuthToken();
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token: token
    });

});



module.exports={
    registerUser,
    loginUser
}