const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    images:{
        type:String,
        default:''
    }
}, 
{ timestamps: true }); 

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};