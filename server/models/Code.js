const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User/Student model
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['python', 'javascript', 'c', 'cpp', 'java', 'sql', 'html', 'css']
    },
    code: {
        type: String,
        required: true
    },
    versionName: {
        type: String,
        default: 'Untitled'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Code', codeSchema);
