const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    reason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Holiday', HolidaySchema);
