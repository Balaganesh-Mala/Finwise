const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true
        });
        fs.unlinkSync(filePath);
        return result;
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
};

// @route   GET /api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private (Admin)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an image' });
        }

        const { title, excerpt, content, author, category } = req.body;

        const result = await uploadToCloudinary(req.file.path, 'blogs');
        
        const newBlog = new Blog({
            title,
            excerpt,
            content,
            author,
            category,
            imageUrl: result.secure_url,
            imagePublicId: result.public_id
        });

        const blog = await newBlog.save();
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private (Admin)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        const { title, excerpt, content, author, category } = req.body;

        const updateData = {
            title, excerpt, content, author, category
        };

        if (req.file) {
            // Delete old image
            if (blog.imagePublicId) {
                await cloudinary.uploader.destroy(blog.imagePublicId);
            }
            // Upload new
            const result = await uploadToCloudinary(req.file.path, 'blogs');
            updateData.imageUrl = result.secure_url;
            updateData.imagePublicId = result.public_id;
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        // Clean up Cloudinary
        if (blog.imagePublicId) {
            await cloudinary.uploader.destroy(blog.imagePublicId);
        }

        await blog.deleteOne();
        res.json({ msg: 'Blog removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
