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
        required: true // Needed to delete from Cloudinary if needed
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
