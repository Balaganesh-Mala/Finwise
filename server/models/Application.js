const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    resumePublicId: {
        type: String,
        // Optional — only set when a file is uploaded to Cloudinary (not when URL is provided)
    },
    consent: {
        salary: Boolean,
        hiringProcess: Boolean,
        interview: Boolean,
        joining: Boolean,
        terms: Boolean
    },
    status: {
        type: String,
        enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected'],
        default: 'New'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);
