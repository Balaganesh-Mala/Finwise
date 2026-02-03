const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
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

// Get Settings (Create default if not exists)
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Settings
router.put('/', upload.single('logo'), async (req, res) => {
  try {
    // req.body fields will be available here
    // Note: Nested objects like 'contact' and 'socials' might come as strings if sent via FormData
    // We need to parse them if they are strings.
    let { siteTitle, logoUrl, contact, socials, hiringRounds } = req.body;

    // Handle File Upload
    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'settings');
        logoUrl = result.secure_url;
    }

    // Parse nested objects if they are strings (JSON)
    if (typeof contact === 'string') {
        try { contact = JSON.parse(contact); } catch (e) {}
    }
    if (typeof socials === 'string') {
        try { socials = JSON.parse(socials); } catch (e) {}
    }
    if (typeof hiringRounds === 'string') {
        try { hiringRounds = JSON.parse(hiringRounds); } catch (e) {}
    }
    
    // Check if settings exist, if not create new
    let settings = await Setting.findOne();
    if (!settings) {
        // Prepare initial data
        const initialData = { ...req.body, logoUrl };
        if (contact) initialData.contact = contact;
        if (socials) initialData.socials = socials;
        if (hiringRounds) initialData.hiringRounds = hiringRounds;
        
        settings = await Setting.create(initialData);
        return res.json(settings);
    }

    // Update fields
    const updateFields = {
        siteTitle,
        contact,
        socials,
        hiringRounds
    };
    if (logoUrl) updateFields.logoUrl = logoUrl;

    const updatedSettings = await Setting.findOneAndUpdate(
        {}, 
        { $set: updateFields },
        { new: true, runValidators: true, upsert: true }
    );

    res.json(updatedSettings);
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
