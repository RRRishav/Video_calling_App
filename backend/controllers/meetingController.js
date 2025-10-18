// backend/controllers/meetingController.js
const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');

exports.createMeeting = async (req, res) => {
  try {
    const id = uuidv4();
    const meeting = new Meeting({ meetingId: id, title: req.body.title || 'Untitled Meeting' });
    await meeting.save();
    res.json({ meetingId: id, link: `${req.protocol}://${req.get('host')}/room/${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const m = await Meeting.findOne({ meetingId: req.params.id });
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, scheduledAt } = req.body;
    const meeting = new Meeting({ meetingId: uuidv4(), title, scheduledAt });
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({}).sort({ scheduledAt: 1 }).limit(50);
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
