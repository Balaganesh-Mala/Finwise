const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for a user (Student or Trainer)
// @access  Public (or Protected)
router.get('/', async (req, res) => {
    try {
        const { studentId, recipientId, recipientModel = 'Student' } = req.query;
        const id = studentId || recipientId;
        
        if (!id) return res.status(400).json({ message: 'Recipient ID required' });

        const notifications = await Notification.find({ recipient: id, recipientModel })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20
        
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/notifications/create
// @desc    Create a notification (System/Admin use)
router.post('/create', async (req, res) => {
    try {
        const { recipient, recipientModel = 'Student', title, message, type, link } = req.body;
        const newNotification = new Notification({
            recipient,
            recipientModel,
            title,
            message,
            type,
            link
        });
        await newNotification.save();
        res.json(newNotification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all as read for a student
router.put('/mark-all-read', async (req, res) => {
    try {
        const { studentId } = req.body;
        await Notification.updateMany({ recipient: studentId, isRead: false }, { isRead: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
