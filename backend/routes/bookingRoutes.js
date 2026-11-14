const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Links to your Model

// 1. Create a new booking
router.post('/book', async (req, res) => {
    try {
        const { userId, busId, seats, totalAmount } = req.body;
        const newBooking = new Booking({
            user: userId,
            busId,
            seats,
            totalAmount
        });
        await newBooking.save();
        res.status(201).json({ msg: "Booking Successful!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ msg: "Server Error during booking" });
    }
});

// 2. Get all occupied seats for a specific bus
router.get('/seats/:busId', async (req, res) => {
    try {
        const bookings = await Booking.find({ busId: req.params.busId });
        let occupiedSeats = [];
        bookings.forEach(b => {
            occupiedSeats = [...occupiedSeats, ...b.seats];
        });
        res.json(occupiedSeats);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching seats" });
    }
});

module.exports = router;