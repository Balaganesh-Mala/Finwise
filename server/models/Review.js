const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Please add a student name']
    },
    courseTaken: {
        type: String,
        required: [true, 'Please add the course taken']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    reviewText: {
        type: String,
        required: [true, 'Please add review text']
    },
    studentImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
