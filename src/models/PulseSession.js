const mongoose = require('mongoose');

const pulseSessionSchema = new mongoose.Schema({
  mood: { type: String, enum: ['happy', 'stressed', 'talk', 'focused'], required: true },
  topic: { type: String, enum: ['work', 'study', 'relationships', 'football', 'technology'], required: true },
  privacy: { type: String, enum: ['known', 'anonymous'], required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, required: true, index: true },
  closed: { type: Boolean, default: false },
}, { timestamps: true });

const PulseSession = mongoose.model('PulseSession', pulseSessionSchema);
module.exports = { PulseSession };
