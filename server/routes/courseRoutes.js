const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Fields for Upload
const cpUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'syllabusPdf', maxCount: 1 },
    { name: 'brochurePdf', maxCount: 1 }
]);

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder, resourceType = 'auto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true
        });
        fs.unlinkSync(filePath); // Delete local file
        return result;
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
};

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Course not found' });
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses
// @desc    Create a new course with files
// @access  Private (Admin)
router.post('/', cpUpload, async (req, res) => {
    try {
        const { title, description, overview, duration, fee, skillLevel, highlights, syllabus } = req.body;
        
        const courseData = {
            title, description, overview, duration, fee, skillLevel,
            highlights: highlights ? JSON.parse(highlights) : [],
            syllabus: syllabus ? JSON.parse(syllabus) : []
        };

        // Handle Image Upload
        if (req.files['image']) {
            const result = await uploadToCloudinary(req.files['image'][0].path, 'courses/images', 'image');
            courseData.imageUrl = result.secure_url;
            courseData.imagePublicId = result.public_id;
        }

        // Handle Syllabus PDF
        if (req.files['syllabusPdf']) {
            // Force Raw for PDFs to ensure consistent handling
            const result = await uploadToCloudinary(req.files['syllabusPdf'][0].path, 'courses/docs', 'raw');
            courseData.syllabusPdf = { url: result.secure_url, publicId: result.public_id };
        }

        // Handle Brochure PDF
        if (req.files['brochurePdf']) {
            const result = await uploadToCloudinary(req.files['brochurePdf'][0].path, 'courses/docs', 'raw');
            courseData.brochurePdf = { url: result.secure_url, publicId: result.public_id };
        }

        const newCourse = new Course(courseData);
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error('Create Course Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Admin)
router.put('/:id', cpUpload, async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const { title, description, overview, duration, fee, skillLevel, highlights, syllabus } = req.body;
        
        let updateData = {
            title, description, overview, duration, fee, skillLevel
        };

        if (highlights) updateData.highlights = JSON.parse(highlights);
        if (syllabus) updateData.syllabus = JSON.parse(syllabus);

        // Handle Image Update
        if (req.files['image']) {
            if (course.imagePublicId) await cloudinary.uploader.destroy(course.imagePublicId);
            const result = await uploadToCloudinary(req.files['image'][0].path, 'courses/images', 'image');
            updateData.imageUrl = result.secure_url;
            updateData.imagePublicId = result.public_id;
        }

         // Handle Syllabus PDF Update
         if (req.files['syllabusPdf']) {
            if (course.syllabusPdf && course.syllabusPdf.publicId) {
                await cloudinary.uploader.destroy(course.syllabusPdf.publicId, { resource_type: 'raw' });
            }
            const result = await uploadToCloudinary(req.files['syllabusPdf'][0].path, 'courses/docs', 'raw');
            updateData.syllabusPdf = { url: result.secure_url, publicId: result.public_id };
        }

        // Handle Brochure PDF Update
        if (req.files['brochurePdf']) {
            if (course.brochurePdf && course.brochurePdf.publicId) {
                await cloudinary.uploader.destroy(course.brochurePdf.publicId, { resource_type: 'raw' });
            }
            const result = await uploadToCloudinary(req.files['brochurePdf'][0].path, 'courses/docs', 'raw');
            updateData.brochurePdf = { url: result.secure_url, publicId: result.public_id };
        }

        course = await Course.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        res.json(course);
    } catch (err) {
        console.error('Update Course Error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course and its files
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Clean up Cloudinary
        if (course.imagePublicId) await cloudinary.uploader.destroy(course.imagePublicId);
        if (course.syllabusPdf && course.syllabusPdf.publicId) {
            await cloudinary.uploader.destroy(course.syllabusPdf.publicId, { resource_type: 'raw' });
        }
        if (course.brochurePdf && course.brochurePdf.publicId) {
            await cloudinary.uploader.destroy(course.brochurePdf.publicId, { resource_type: 'raw' });
        }

        await course.deleteOne();
        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:id/download/:type
// @desc    Securely download course assets (brochure/syllabus)
// @access  Public (Authenticated URL Redirect)
router.get('/:id/download/:type', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found');

        const type = req.params.type; // 'syllabus' or 'brochure'
        let fileData = null;

        if (type === 'syllabus') fileData = course.syllabusPdf;
        else if (type === 'brochure') fileData = course.brochurePdf;
        else return res.status(400).send('Invalid type');

        if (!fileData || !fileData.url) return res.status(404).send('File not available');

        // Extract version for signature
        const versionMatch = fileData.url.match(/\/v(\d+)\//);
        const version = versionMatch ? versionMatch[1] : undefined;

        // Generate Authenticated Signed URL
        const signedUrl = cloudinary.url(fileData.publicId, {
            resource_type: 'raw',
            type: 'authenticated',
            sign_url: true,
            flags: 'attachment',
            version: version, 
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });

        res.redirect(signedUrl);

    } catch (err) {
        console.error('Download Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
