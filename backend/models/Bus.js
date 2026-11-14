const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, trim: true },
  routeFrom: { type: String, required: true, trim: true },
  routeTo: { type: String, required: true, trim: true },
  currentLat: { type: Number, required: true },
  currentLng: { type: Number, required: true },
  availableSeats: { type: Number, default: 40 },
  eta: { type: String, default: '15 mins' },
  status: { type: String, enum: ['Active', 'Delayed', 'Maintenance', 'Inactive'], default: 'Active' },
  driverName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);
