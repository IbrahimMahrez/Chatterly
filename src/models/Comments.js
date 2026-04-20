const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
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
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        index: true
    }
    ,
    parentComment: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Comment',
  default: null
},
likes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
]
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };