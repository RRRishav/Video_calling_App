// backend/routes/meetings.js
const express = require('express');
const router = express.Router();
const { createMeeting, getMeetingById, scheduleMeeting, listMeetings } = require('../controllers/meetingController');

router.post('/create', createMeeting);
router.get('/:id', getMeetingById);
router.post('/schedule', scheduleMeeting);
router.get('/mine', listMeetings);

module.exports = router;
