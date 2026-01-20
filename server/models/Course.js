const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title']
    },
    overview: {
        type: String,
        required: [true, 'Please add a course overview']
    },
    description: {
        type: String,
        required: [true, 'Please add a short description']
    },
    duration: {
        type: String,
        required: [true, 'Please add course duration']
    },
    highlights: {
        type: [String], // Array of strings
        default: []
    },
    syllabus: [{
        title: String,
        modules: [String]
    }],
    fee: {
        type: String, 
        required: [true, 'Please add course fee']
    },
    skillLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    imageUrl: {
        type: String,
        default: 'no-photo.jpg'
    },
    imagePublicId: {
        type: String
    },
    syllabusPdf: {
        url: String,
        publicId: String
    },
    brochurePdf: {
        url: String,
        publicId: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
