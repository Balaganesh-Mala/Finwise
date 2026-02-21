const mongoose = require('mongoose');

const BatchStudentSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
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
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    }
}, { timestamps: true });

// A student can only be in one batch per course
BatchStudentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('BatchStudent', BatchStudentSchema);
