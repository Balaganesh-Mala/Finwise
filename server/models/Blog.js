const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    coverImage: {
        type: String,
        default: 'no-photo.jpg'
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    tags: {
        type: [String]
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create blog slug from the title
BlogSchema.pre('save', function(next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
