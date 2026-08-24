const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true, trim: true },
  audioUrl: { type: String, default: '' },
  audioDuration: { type: Number, default: 0 },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  attachmentType: { type: String, default: '' },
  attachmentSize: { type: Number, default: 0 },
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
