const mongoose = require('mongoose');

const savedMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
}, { timestamps: true });

savedMessageSchema.index({ user: 1, message: 1 }, { unique: true });

const SavedMessage = mongoose.model('SavedMessage', savedMessageSchema);

module.exports = { SavedMessage };
