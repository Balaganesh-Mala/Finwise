const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a banner title']
    },
    fileUrl: {
        type: String,
        required: [true, 'Please upload a file']
    },
    publicId: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    order: {
        type: Number,
        required: [true, 'Please set a display order (1-50)'],
        min: 1,
        max: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', BannerSchema);
