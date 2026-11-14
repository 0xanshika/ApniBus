const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    busId: { 
        type: String, 
        required: true // e.g., "APNI-101"
    },
    seats: { 
        type: [Number], 
        required: true // e.g., [5, 6]
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled'], 
        default: 'Confirmed' 
    },
    bookingDate: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Booking', BookingSchema);