const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, getSupervisors, toggleUserStatus, getNotifications, markNotificationRead } = require('../controllers/userController');

router.get('/supervisors', protect, getSupervisors);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/all', protect, authorize('admin'), getAllUsers);
router.put('/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
