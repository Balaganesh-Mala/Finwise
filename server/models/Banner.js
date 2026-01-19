const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    subtitle: {
        type: String
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    ctaText: {
        type: String
    },
    ctaLink: {
        type: String
    },
    order: {
        type: Number,
        default: 0
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
