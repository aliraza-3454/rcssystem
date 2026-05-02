const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    const topics = await Topic.find({ ...query, status: 'approved' })
      .select('title progressReports student')
      .populate('student', 'name');
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
