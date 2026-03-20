const mongoose = require('mongoose');

const StudentJobApplicationSchema = new mongoose.Schema({
    studentId: {
        type: String, // stored as string from auth context
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Interview Scheduled', 'Offer Received', 'Rejected'],
        default: 'Applied'
    },
    notes: {
        type: String,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// One application per student per job
StudentJobApplicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('StudentJobApplication', StudentJobApplicationSchema);
