const mongoose = require('mongoose');

const StudentTaskSubmissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    taskIndex: {
        type: Number,
        required: true,
        default: 0
    },
    answerText: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String,
        default: ''
    },
    filePublicId: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Unique per student + topic + taskIndex
StudentTaskSubmissionSchema.index({ studentId: 1, topicId: 1, taskIndex: 1 }, { unique: true });

module.exports = mongoose.model('StudentTaskSubmission', StudentTaskSubmissionSchema);
