const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    mission: {
        type: String
    },
    vision: {
        type: String
    },
    imageUrl: {
        type: String
    },
    yearsExperience: {
        type: Number
    },
    studentsTrained: {
        type: Number
    },
    highlights: {
        type: [String]
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('About', AboutSchema);
