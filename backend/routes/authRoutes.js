const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });
    if (role !== 'user' && role !== 'admin') return res.status(400).json({ msg: 'Invalid role' });
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ msg: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashed, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server Error during registration' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server Error during login' }); }
});

router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
