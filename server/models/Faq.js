const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question']
    },
    answer: {
        type: String,
        required: [true, 'Please add an answer']
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Faq', FaqSchema);
