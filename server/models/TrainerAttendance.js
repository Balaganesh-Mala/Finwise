const mongoose = require('mongoose');

const trainerAttendanceSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    present: {
        type: Boolean,
        default: false
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    }
});

module.exports = mongoose.model('TrainerAttendance', trainerAttendanceSchema);
