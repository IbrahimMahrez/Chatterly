const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  dueAt: { type: Date, required: true, index: true },
  completed: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null, index: true },
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = { Reminder };
