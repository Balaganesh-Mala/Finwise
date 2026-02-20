const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    callId: {
        type: String,
        required: true,
        unique: true
    },
    transcript: {
        type: String
    },
    summary: {
        type: String
    },
    feedback: {
        type: String
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    },
    duration: {
        type: Number // in seconds
    },
    recordingUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['completed', 'failed', 'processing'],
        default: 'processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', interviewSchema);
