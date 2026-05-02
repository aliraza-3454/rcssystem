const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect, authorize } = require('../middleware/auth');

// GET all topics (admin/supervisor)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'supervisor') query.supervisor = req.user._id;
    const topics = await Topic.find(query)
      .populate('student', 'name email regNo')
      .populate('supervisor', 'name email')
      .sort({ submittedAt: -1 });
    res.json({ success: true, count: topics.length, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit topic
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { title, description, keywords, domain, supervisorId } = req.body;
    // Simple keyword-based duplicate check
    const existing = await Topic.find({ status: { $ne: 'rejected' } });
    let similarityScore = 0;
    const titleWords = title.toLowerCase().split(' ');
    existing.forEach(t => {
      const existWords = t.title.toLowerCase().split(' ');
      const common = titleWords.filter(w => existWords.includes(w) && w.length > 3);
      const score = (common.length / Math.max(titleWords.length, existWords.length)) * 100;
      if (score > similarityScore) similarityScore = score;
    });
    const isDuplicate = similarityScore > 70;
    const topic = await Topic.create({
      title, description, keywords, domain,
      student: req.user._id,
      supervisor: supervisorId || null,
      similarityScore: Math.round(similarityScore),
      isDuplicate
    });
    await topic.populate('student', 'name email regNo');
    res.status(201).json({ success: true, topic, isDuplicate, similarityScore: Math.round(similarityScore) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update topic status (supervisor/admin)
router.put('/:id/status', protect, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { status, feedback, updatedAt: Date.now() },
      { new: true }
    ).populate('student', 'name email').populate('supervisor', 'name email');
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT add progress report
router.put('/:id/progress', protect, authorize('student'), async (req, res) => {
  try {
    const { report, percentage } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { $push: { progressReports: { report, percentage, date: Date.now() } } },
      { new: true }
    );
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE topic
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats for admin
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Topic.countDocuments();
    const pending = await Topic.countDocuments({ status: 'pending' });
    const approved = await Topic.countDocuments({ status: 'approved' });
    const rejected = await Topic.countDocuments({ status: 'rejected' });
    const duplicates = await Topic.countDocuments({ isDuplicate: true });
    res.json({ success: true, stats: { total, pending, approved, rejected, duplicates } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
