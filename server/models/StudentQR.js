const mongoose = require('mongoose');

const StudentQRSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    qrToken: {
        type: String,
        required: true,
        unique: true
    },
    qrImageURL: {
        type: String,
        required: true
    },
    tokenCreatedAt: {
        type: Date,
        default: Date.now
    },
    tokenExpiresAt: {
        type: Date
    }
});

module.exports = mongoose.model('StudentQR', StudentQRSchema);
