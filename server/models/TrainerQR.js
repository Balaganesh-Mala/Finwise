const mongoose = require('mongoose');

const TrainerQRSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
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

module.exports = mongoose.model('TrainerQR', TrainerQRSchema);
