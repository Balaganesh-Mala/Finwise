const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    batchId: {
        type: String, // Or ObjectId if Batch model exists
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    notes: [{
        type: String // URLs to uploaded notes
    }],
    homework: {
        type: String
    },
    meetingLink: {
        type: String
    },
    recordingUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Class', classSchema);
