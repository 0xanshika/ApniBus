const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const [users, buses, reports, bookings, pendingReports] = await Promise.all([
      User.countDocuments(), Bus.countDocuments(), Report.countDocuments(), Booking.countDocuments(), Report.countDocuments({ status: 'Pending' })
    ]);
    res.json({ users, buses, reports, bookings, pendingReports });
  } catch (err) { res.status(500).json({ msg: 'Failed to load stats' }); }
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1, date: -1 });
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ msg: 'Failed to update user' }); }
});

router.delete('/users/:id', async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ msg: 'You cannot delete your own admin account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json({ msg: 'User deleted' });
});

router.get('/notifications', async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ msg: 'Title and message are required' });
    const notification = await Notification.create({ title, message, type: type || 'info', createdBy: req.user._id });
    const io = req.app.get('io');
    if (io) io.emit('notification', notification);
    res.status(201).json(notification);
  } catch (err) { res.status(500).json({ msg: 'Failed to create notification' }); }
});

router.patch('/profile', async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });

    if (email) admin.email = email.trim().toLowerCase();
    if (name) admin.name = name.trim();

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ msg: 'Current password is required' });
      const ok = await bcrypt.compare(currentPassword, admin.password);
      if (!ok) return res.status(400).json({ msg: 'Current password is incorrect' });
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();
    res.json({ id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Email is already in use' });
    res.status(500).json({ msg: 'Failed to update profile' });
  }
});

module.exports = router;
