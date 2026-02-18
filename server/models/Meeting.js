const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // e.g., "10:00 AM"
        required: true
    },
    link: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming Admin is in User collection or similar, actually Admin typically doesn't have a schema in some setups, but we'll store the ID if available, or just 'Admin'
        required: false 
    },
    attendees: {
        type: [String], // Array of Trainer IDs or ['ALL']
        default: ['ALL']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Meeting', meetingSchema);
