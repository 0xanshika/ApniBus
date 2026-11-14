const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'report'], default: 'info' },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
