
const joi=require('joi');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../models/User');




//registration validation
function validateUserRegistration(user){
    const schema=joi.object({
        username:joi.string().min(4).max(30).required(),
        email:joi.string().min(5).max(255).required().email(),
        password:joi.string().min(6).max(255).required(),
        profilePicture:joi.string().uri().allow('')
    });
    return schema.validate(user);
}
//login validation
function validateUserLogin(user){
    const schema=joi.object({
        email:joi.string().min(5).max(25).required().email(),
        password:joi.string().min(6).max(255).required()
    });
    return schema.validate(user);
}
//update validation
function validateUserUpdate(user){
    const schema=joi.object({
        username:joi.string().min(4).max(30),
        email:joi.string().min(5).max(255).email(),
        password:joi.string().min(6).max(255),
        profilePicture:joi.string().uri().allow('')
    });
    return schema.validate(user);
}



module.exports={
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate
}