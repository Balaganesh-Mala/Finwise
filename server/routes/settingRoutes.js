const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

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
router.put('/', async (req, res) => {
  try {
    const { siteTitle, logoUrl, contact, socials } = req.body;
    
    // Check if settings exist, if not create new
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create(req.body);
        return res.json(settings);
    }

    // Update fields
    // We use findOneAndUpdate to cleanly handle the update with $set
    // This avoids issues with merging mongoose subdocuments manually
    const updatedSettings = await Setting.findOneAndUpdate(
        {}, 
        { 
            $set: { 
                siteTitle, 
                logoUrl, 
                contact, 
                socials 
            } 
        },
        { new: true, runValidators: true, upsert: true }
    );

    res.json(updatedSettings);
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
