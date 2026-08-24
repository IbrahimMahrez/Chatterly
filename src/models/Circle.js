const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  dateKey: { type: String, required: true },
}, { timestamps: true });

const circleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 90 },
  goal: { type: String, required: true, trim: true, maxlength: 300 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, min: 3, max: 8, default: 6 },
  endsAt: { type: Date, required: true, index: true },
  checkIns: [checkInSchema],
}, { timestamps: true });

const Circle = mongoose.model('Circle', circleSchema);
module.exports = { Circle };
