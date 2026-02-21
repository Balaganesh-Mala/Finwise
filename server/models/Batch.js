const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Batch name is required'],
        trim: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    maxStudents: {
        type: Number,
        default: 30
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'upcoming', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Batch', BatchSchema);
