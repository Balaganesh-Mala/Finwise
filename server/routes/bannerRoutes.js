const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit (for videos)
});

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto', // Auto-detect image or video
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

// @route   GET /api/banners
// @desc    Get all banners
// @access  Public
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1 });
        res.json(banners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/banners
// @desc    Create a new banner
// @access  Private (Admin)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a file' });
        }

        const { title, order, isActive, description, buttonText, buttonLink } = req.body;

        const result = await uploadToCloudinary(req.file.path, 'banners');
        
        const newBanner = new Banner({
            title,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type, // 'image' or 'video'
            order: order || 50, // Default to end if not specified
            isActive: isActive === 'true',
            description,
            buttonText,
            buttonLink
        });

        const banner = await newBanner.save();
        res.json(banner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/banners/:id
// @desc    Update banner (Order, Status, File, Details)
// @access  Private (Admin)
router.put('/:id', upload.single('file'), async (req, res) => {
    try {
        const { title, order, isActive, description, buttonText, buttonLink } = req.body;
        
        let banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ msg: 'Banner not found' });

        let updateData = {
            title,
            order,
            description,
            buttonText,
            buttonLink
        };
        
        if (typeof isActive !== 'undefined') updateData.isActive = isActive === 'true' || isActive === true;

        // Handle File Update
        if (req.file) {
            // Delete old file
            try {
                await cloudinary.uploader.destroy(banner.publicId, { 
                    resource_type: banner.resourceType 
                });
            } catch (err) {
                console.error("Error deleting old banner:", err);
            }

            // Upload new file
            const result = await uploadToCloudinary(req.file.path, 'banners');
            updateData.fileUrl = result.secure_url;
            updateData.publicId = result.public_id;
            updateData.resourceType = result.resource_type;
        }

        banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(banner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/banners/:id
// @desc    Delete banner
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ msg: 'Banner not found' });

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(banner.publicId, { 
            resource_type: banner.resourceType 
        });

        await banner.deleteOne();
        res.json({ msg: 'Banner removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
