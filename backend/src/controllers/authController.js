const jwt  = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const safeUser = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role, regNo: u.regNo, department: u.department,
  expertise: u.expertise, isActive: u.isActive,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, regNo, department, expertise } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name, email: email.toLowerCase(), password,
      role, regNo, department, expertise,
    });

    res.status(201).json({ success: true, token: generateToken(user.id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

    res.json({ success: true, token: generateToken(user.id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, expertise } = req.body;
    await req.user.update({ name, department, expertise });
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
