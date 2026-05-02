const { User, Notification } = require('../models');

// GET /api/users/all  (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/supervisors
exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.findAll({
      where: { role: 'supervisor', isActive: true },
      attributes: { exclude: ['password'] },
    });
    res.json({ success: true, supervisors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id/toggle  (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ isActive: !user.isActive });
    res.json({ success: true, user: { id: user.id, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, recipientId: req.user.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
