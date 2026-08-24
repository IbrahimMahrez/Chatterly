const mongoose=require('mongoose');
const joi=require('joi');
const jwt=require('jsonwebtoken');


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minlength:4,
        maxlength:300,
        unique:true
    },
    email:{ 
        type:String,
        required:true,
        minlength:5,
        maxlength:2505,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:255
    },
   profilePicture: {
    type: String,
    default: ''
},
    
    isAdmin:{
        type:Boolean,
        default:false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    followers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
],
following: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
]
});
    //generate auth token method
userSchema.methods.generateAuthToken=function(){
    // Keep users signed in for a practical period. Set JWT_EXPIRES_IN in the
    // server environment to override this value (for example: "7d" or "30d").
    const token=jwt.sign(
        {_id:this._id,isAdmin:this.isAdmin},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN || '30d'}
    );
    return token;
}

const User=mongoose.model('User',userSchema);



module.exports={
    User
    
}
