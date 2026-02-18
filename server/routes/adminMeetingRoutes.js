const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Trainer = require('../models/Trainer');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create a new meeting
// @route   POST /api/admin/meetings
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { title, description, date, time, link, attendees } = req.body;

        const meeting = await Meeting.create({
            title,
            description,
            date,
            time,
            link,
            attendees: attendees || ['ALL']
        });

        // Notify Trainers
        let trainers = [];
        if (attendees && attendees.length > 0 && !attendees.includes('ALL')) {
             trainers = await Trainer.find({ _id: { $in: attendees }, status: 'active' });
        } else {
             trainers = await Trainer.find({ status: 'active' });
        }

        // Send Emails and Create Notifications
        const emailPromises = trainers.map(async (trainer) => {
            // System Notification
            await Notification.create({
                recipient: trainer._id,
                recipientModel: 'Trainer',
                title: `New Meeting: ${title}`,
                message: `You have a new meeting scheduled for ${new Date(date).toLocaleDateString()} at ${time}.`,
                type: 'alert',
                link: link || '/dashboard' // Redirect to dashboard or meeting link
            });

            // Email
            const emailContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Meeting Scheduled</h2>
                    <p><strong>Topic:</strong> ${title}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Link:</strong> <a href="${link}">${link}</a></p>
                    <p>${description || ''}</p>
                </div>
            `;
            
             // Use a try-catch for email to not block the response if one fails
            try {
                 await sendEmail(trainer.email, `New Meeting: ${title}`, emailContent);
            } catch (e) {
                console.error(`Failed to email ${trainer.email}`, e);
            }
        });

        await Promise.all(emailPromises);

        res.status(201).json(meeting);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get all meetings
// @route   GET /api/admin/meetings
// @access  Admin/Trainer (Protected)
router.get('/', async (req, res) => {
    try {
        // Can add query params to filter by date if needed
        const meetings = await Meeting.find().sort({ date: -1 });
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a meeting
// @route   DELETE /api/admin/meetings/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ message: 'Meeting removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
