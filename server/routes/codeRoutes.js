const express = require('express');
const router = express.Router();
const Code = require('../models/Code');

// Middleware to check authentication should be added here
// For now assuming req.user or passing studentId in body for simplicity if auth middleware isn't globally applied
// I'll check `server/routes/studentRoutes.js` later to see how auth is handled.

// SAVE Code
router.post('/save', async (req, res) => {
    try {
        const { studentId, language, code, versionName } = req.body;
        
        const newCode = await Code.create({
            studentId,
            language,
            code,
            versionName
        });
        
        res.status(201).json({ success: true, data: newCode });
    } catch (error) {
        console.error('Error saving code:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// GET User's Code
router.get('/:studentId', async (req, res) => {
    try {
        const codes = await Code.find({ studentId: req.params.studentId }).sort({ timestamp: -1 });
        res.json({ success: true, data: codes });
    } catch (error) {
        console.error('Error fetching code:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
