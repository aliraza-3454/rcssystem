const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitTopic, getMyTopics, getSupervisorTopics, getAllTopics,
  updateTopicStatus, getSuggestions, getStats
} = require('../controllers/topicController');

router.get('/suggestions', protect, getSuggestions);
router.get('/stats', protect, authorize('admin'), getStats);
router.post('/', protect, authorize('student'), submitTopic);
router.get('/my', protect, authorize('student'), getMyTopics);
router.get('/supervisor', protect, authorize('supervisor'), getSupervisorTopics);
router.get('/all', protect, authorize('admin'), getAllTopics);
router.put('/:id/status', protect, authorize('supervisor', 'admin'), updateTopicStatus);

module.exports = router;
