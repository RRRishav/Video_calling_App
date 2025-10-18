// backend/models/Meeting.js
const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  meetingId: { type: String, unique: true, required: true },
  title: String,
  scheduledAt: Date,
  createdAt: { type: Date, default: Date.now },
  password: String,
  creator: String
});

module.exports = mongoose.model('Meeting', MeetingSchema);
