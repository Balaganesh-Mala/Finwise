const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a blog title'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    excerpt: {
        type: String,
        required: [true, 'Please add a short excerpt'],
        maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    content: {
        type: String, // Rich Text / HTML
        required: [true, 'Please add blog content']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please upload a cover image']
    },
    imagePublicId: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'JobReady Team'
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Career Advice', 'Technology', 'Design', 'Development', 'Success Stories', 'Other']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from title
BlogSchema.pre('save', function(next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
