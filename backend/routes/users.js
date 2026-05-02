const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET supervisors list (for student topic submission)
router.get('/supervisors', protect, async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor', isActive: true }).select('name email expertise department');
    res.json({ success: true, supervisors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT toggle user active status
router.put('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    res.json({ success: true, stats: { totalStudents, totalSupervisors, totalAdmins } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
