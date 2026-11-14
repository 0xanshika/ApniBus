const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
  busNumber: { type: String, required: true, trim: true },
  issue: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  adminNote: { type: String, default: '' },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
