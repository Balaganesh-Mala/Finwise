const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    method: {
        type: String,
        enum: ['qr', 'manual'],
        default: 'qr'
    },
    markedBy: {
        type: String,
        default: 'system'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a student can only have one attendance record per day
// We might want to use a compound index on studentId and a truncated date, 
// but since the date stored includes time, we will handle the "one per day" logic in the controller 
// by querying for the start and end of the current day.
// However, strictly speaking, `date` here seems to serve as "attendance date". 
// To enforcement at DB level, we'd need a separate "dateString" field like "YYYY-MM-DD".
// For now, logic in controller is fine.

module.exports = mongoose.model('Attendance', AttendanceSchema);
