const mongoose = require('mongoose');

const StudentCourseSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    accessType: {
        type: String,
        enum: ['purchased', 'granted'],
        default: 'purchased'
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a student can't "unlock" the same course twice
StudentCourseSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('StudentCourse', StudentCourseSchema);
