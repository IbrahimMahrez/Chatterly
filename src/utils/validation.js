
const joi=require('joi');
// Validate registration input.
function validateUserRegistration(user){
    const schema=joi.object({
        username:joi.string().min(4).max(30).required(),
        email:joi.string().min(5).max(255).required().email(),
        password:joi.string().min(6).max(255).required(),
        profilePicture:joi.string().max(500).allow('')
    });
    return schema.validate(user);
}
// Validate login input.
function validateUserLogin(user){
    const schema=joi.object({
        email:joi.string().min(5).max(205).required().email(),
        password:joi.string().min(6).max(255).required()
    });
    return schema.validate(user);
}
// Validate profile update input.
function validateUserUpdate(user){
    const schema=joi.object({
        username:joi.string().min(4).max(30),
        email:joi.string().min(5).max(255).email(),
        password:joi.string().min(6).max(255),
        profilePicture:joi.string().max(500).allow('')
    });
    return schema.validate(user);
}



module.exports={
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate
}