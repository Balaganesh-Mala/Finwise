const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// @route   POST /api/inquiries
// @desc    Create a new inquiry
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, courseInterested, message, source } = req.body;

        const newInquiry = new Inquiry({
            name,
            email,
            phone,
            courseInterested,
            message,
            source: source || 'contact_form'
        });

        const inquiry = await newInquiry.save();
        res.status(201).json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Public (Should be Admin only)
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/inquiries/:id
// @desc    Delete an inquiry
// @access  Public (Should be Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }

        await inquiry.deleteOne();
        res.json({ msg: 'Inquiry removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/inquiries/:id
// @desc    Update inquiry status
// @access  Public (Should be Admin only)
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }

        inquiry.status = status;
        await inquiry.save();

        res.json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
