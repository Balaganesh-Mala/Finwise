const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['image', 'video', 'youtube'],
        default: 'image'
    },
    mediaUrl: {
        type: String // Cloudinary URL for images/videos
    },
    youtubeUrl: {
        type: String // YouTube link
    },
    publicId: {
        type: String // Cloudinary public ID for deletion
    },
    buttonText: {
        type: String
    },
    buttonLink: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    targetBatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch' // Optional: target specific batch
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
