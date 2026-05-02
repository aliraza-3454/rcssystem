const { Op } = require('sequelize');
const { Topic, User, Notification } = require('../models');

// ── Similarity helper ─────────────────────────────────────────
const checkSimilarity = async (title, excludeId = null) => {
  const where = { status: { [Op.ne]: 'rejected' } };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const topics = await Topic.findAll({ where, attributes: ['title'] });
  const words  = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let max = 0;

  for (const t of topics) {
    const tw  = t.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const common = words.filter(w => tw.includes(w)).length;
    const score  = (common / Math.max(words.length, tw.length, 1)) * 100;
    if (score > max) max = score;
  }
  return Math.round(max);
};

// ── POST /api/topics ──────────────────────────────────────────
exports.submitTopic = async (req, res) => {
  try {
    const { title, description, keywords, domain, supervisorId } = req.body;

    const similarityScore = await checkSimilarity(title);
    if (similarityScore > 70)
      return res.status(400).json({
        success: false,
        message: `Topic too similar to an existing submission (${similarityScore}% match). Please choose a more unique topic.`,
      });

    const topic = await Topic.create({
      title, description,
      keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      domain,
      studentId:    req.user.id,
      supervisorId: supervisorId || null,
      similarityScore,
    });

    if (supervisorId) {
      await Notification.create({
        recipientId: supervisorId,
        message: `New topic submitted: "${title}" by ${req.user.name}`,
        type: 'info',
      });
    }

    res.status(201).json({ success: true, topic, similarityScore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/topics/my  (student) ─────────────────────────────
exports.getMyTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: { studentId: req.user.id },
      include: [{ model: User, as: 'supervisor', attributes: ['id','name','email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/topics/supervisor  ───────────────────────────────
exports.getSupervisorTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: { supervisorId: req.user.id },
      include: [{ model: User, as: 'student', attributes: ['id','name','email','regNo'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/topics/all  (admin) ──────────────────────────────
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [
        { model: User, as: 'student',    attributes: ['id','name','email','regNo'] },
        { model: User, as: 'supervisor', attributes: ['id','name','email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/topics/:id/status  ───────────────────────────────
exports.updateTopicStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const topic = await Topic.findByPk(req.params.id, {
      include: [{ model: User, as: 'student', attributes: ['id','name'] }],
    });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const updates = { status };
    if (req.user.role === 'supervisor') updates.supervisorFeedback = feedback;
    if (req.user.role === 'admin')      updates.adminNotes          = feedback;
    await topic.update(updates);

    await Notification.create({
      recipientId: topic.student.id,
      message: `Your topic "${topic.title}" has been ${status}.${feedback ? ' — ' + feedback : ''}`,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning',
    });

    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/topics/suggestions  ─────────────────────────────
exports.getSuggestions = async (req, res) => {
  try {
    const { domain } = req.query;
    const d = domain || 'Computer Science';
    const suggestions = [
      { title: `AI-Based ${d} Analysis System`,             keywords: [d, 'AI', 'Machine Learning'] },
      { title: `Blockchain for ${d} Data Security`,         keywords: [d, 'Blockchain', 'Security'] },
      { title: `IoT-Enabled ${d} Monitoring Platform`,      keywords: [d, 'IoT', 'Real-time'] },
      { title: `NLP-Driven ${d} Recommendation Engine`,     keywords: [d, 'NLP', 'Recommendation'] },
      { title: `Cloud-Based ${d} Management System`,        keywords: [d, 'Cloud', 'Scalability'] },
      { title: `Deep Learning for ${d} Pattern Recognition`,keywords: [d, 'Deep Learning', 'CNN'] },
    ];
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/topics/stats  (admin) ───────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totalTopics, approved, pending, rejected, totalStudents, totalSupervisors] = await Promise.all([
      Topic.count(),
      Topic.count({ where: { status: 'approved'  } }),
      Topic.count({ where: { status: 'pending'   } }),
      Topic.count({ where: { status: 'rejected'  } }),
      User.count ({ where: { role:   'student'   } }),
      User.count ({ where: { role:   'supervisor'} }),
    ]);
    res.json({ success: true, stats: { totalTopics, approved, pending, rejected, totalStudents, totalSupervisors } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
