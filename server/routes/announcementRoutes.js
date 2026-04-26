const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
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

// @route   GET /api/announcements
// @desc    Get all announcements (Admin)
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/announcements/active
// @desc    Get current active spotlight for students
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const announcement = await Announcement.findOne({
            isActive: true,
            $and: [
                { $or: [{ startDate: { $lte: now } }, { startDate: { $exists: false } }, { startDate: null }] },
                { $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }, { endDate: null }] }
            ]
        }).sort({ createdAt: -1 });

        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/announcements
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            type, 
            youtubeUrl, 
            buttonText, 
            buttonLink, 
            startDate, 
            endDate, 
            isActive 
        } = req.body;

        let mediaData = { url: null, publicId: null };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, 'announcements');
            mediaData.url = result.secure_url;
            mediaData.publicId = result.public_id;
        }

        const newAnnouncement = new Announcement({
            title,
            description,
            type,
            youtubeUrl,
            mediaUrl: mediaData.url,
            publicId: mediaData.publicId,
            buttonText,
            buttonLink,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isActive: isActive === 'true' || isActive === true
        });

        const announcement = await newAnnouncement.save();
        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/announcements/:id
router.put('/:id', upload.single('file'), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            type, 
            youtubeUrl, 
            buttonText, 
            buttonLink, 
            startDate, 
            endDate, 
            isActive 
        } = req.body;

        let announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found' });

        let updateData = {
            title,
            description,
            type,
            youtubeUrl,
            buttonText,
            buttonLink,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null
        };

        if (typeof isActive !== 'undefined') updateData.isActive = isActive === 'true' || isActive === true;

        if (req.file) {
            // Delete old
            if (announcement.publicId) {
                await cloudinary.uploader.destroy(announcement.publicId);
            }
            const result = await uploadToCloudinary(req.file.path, 'announcements');
            updateData.mediaUrl = result.secure_url;
            updateData.publicId = result.public_id;
        }

        announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Announcement not found' });

        if (announcement.publicId) {
            await cloudinary.uploader.destroy(announcement.publicId);
        }

        await announcement.deleteOne();
        res.json({ msg: 'Announcement removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
