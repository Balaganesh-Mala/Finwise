const mongoose = require('mongoose');

const StudentAssignmentSubmissionSchema = new mongoose.Schema({
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
    assignmentIndex: {
        type: Number,
        required: true,
        default: 0
    },
    fileUrl: {
        type: String,
        required: true
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

// Unique per student + topic + assignmentIndex (one submission per assignment slot)
StudentAssignmentSubmissionSchema.index({ studentId: 1, topicId: 1, assignmentIndex: 1 }, { unique: true });

module.exports = mongoose.model('StudentAssignmentSubmission', StudentAssignmentSubmissionSchema);
