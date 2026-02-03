const mongoose = require('mongoose');

const trainerExamSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    mcqScore: {
        type: Number,
        default: 0
    },
    videoUrl: {
        type: String
    },
    assignments: [{
        type: String
    }],
    writtenTest: {
        type: String // Content or URL to file
    },
    mcqAnswers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    examDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'reviewed'],
        default: 'pending'
    }
});

module.exports = mongoose.model('TrainerExam', trainerExamSchema);
