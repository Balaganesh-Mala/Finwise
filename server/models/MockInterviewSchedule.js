const mongoose = require('mongoose');

const mockInterviewScheduleSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: false
    },
    interviewType: {
        type: String,
        default: 'Mock Interview'
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // e.g., "10:00 AM"
        required: true
    },
    endTime: {
        type: String, // e.g., "10:15 AM"
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 15
    },
    meetingPlatform: {
        type: String,
        enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'Custom Link'],
        default: 'Google Meet'
    },
    meetingLink: {
        type: String,
        required: true
    },
    meetingPasscode: {
        type: String
    },
    instructions: {
        type: String
    },
    requiredDocs: [{
        type: String // e.g., "Resume", "Calculator"
    }],
    status: {
        type: String,
        enum: ['Scheduled', 'Rescheduled', 'Completed', 'Missed', 'Cancelled'],
        default: 'Scheduled'
    },
    attendance: {
        type: String,
        enum: ['Pending', 'Present', 'Absent'],
        default: 'Pending'
    },
    remindersSent: {
        dayBefore: { type: Boolean, default: false },
        hourBefore: { type: Boolean, default: false },
        tenMinutesBefore: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for performance on cron queries
mockInterviewScheduleSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('MockInterviewSchedule', mockInterviewScheduleSchema);
