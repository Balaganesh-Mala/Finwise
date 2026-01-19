const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    duration: {
        type: String, // e.g., '3 Months'
        required: [true, 'Please add course duration']
    },
    fee: {
        type: String, // e.g., '$500' or '50000 INR'
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
    syllabusUrl: {
        type: String // PDF file URL
    },
    viewDetailsLink: {
        type: String
    },
    enrollLink: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
