const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busNumber: 1 });
    res.json(buses);
  } catch (err) { res.status(500).json({ msg: 'Failed to fetch buses' }); }
});

router.get('/:id', async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) return res.status(404).json({ msg: 'Bus not found' });
  res.json(bus);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { busNumber, routeFrom, routeTo, currentLat, currentLng, availableSeats, eta, status } = req.body;
    if (!busNumber || !routeFrom || !routeTo) return res.status(400).json({ msg: 'Bus number, source and destination are required' });
    const exists = await Bus.findOne({ busNumber: busNumber.trim() });
    if (exists) return res.status(400).json({ msg: 'Bus number already exists' });

    const bus = await Bus.create({
      busNumber: busNumber.trim(), routeFrom, routeTo,
      currentLat: Number(currentLat) || 28.6139,
      currentLng: Number(currentLng) || 77.2090,
      availableSeats: Number.isFinite(Number(availableSeats)) ? Number(availableSeats) : 40,
      eta: eta || '15 mins', status: status || 'Active'
    });
    res.status(201).json(bus);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Failed to create bus' }); }
});

router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    const io = req.app.get('io');
    if (io) io.emit('busUpdate', { busId: bus.busNumber, lat: bus.currentLat, lng: bus.currentLng, eta: bus.eta, status: bus.status });
    res.json(bus);
  } catch (err) { res.status(500).json({ msg: 'Failed to update bus' }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);
  if (!bus) return res.status(404).json({ msg: 'Bus not found' });
  res.json({ msg: 'Bus deleted' });
});

module.exports = router;
