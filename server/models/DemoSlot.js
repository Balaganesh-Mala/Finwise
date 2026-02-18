const mongoose = require('mongoose');

const demoSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
});

// Compound index to ensure unique slots per date/time
demoSlotSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('DemoSlot', demoSlotSchema);
