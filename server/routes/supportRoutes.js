const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// @route   GET /api/support/history/:studentId
// @desc    Get chat history for a specific student
router.get('/history/:studentId', async (req, res) => {
    try {
        const messages = await SupportMessage.find({ student: req.params.studentId })
            .sort({ createdAt: 1 })
            .limit(100);
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/support/active-chats
// @desc    Get list of students with active chat history (Admin)
router.get('/active-chats', async (req, res) => {
    try {
        const activeChats = await SupportMessage.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$student",
                    lastMessage: { $first: "$message" },
                    lastSender: { $first: "$sender" },
                    category: { $first: "$category" },
                    timestamp: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$sender", "student"] }, { $eq: ["$isRead", false] }] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: "$studentInfo" },
            { $sort: { timestamp: -1 } }
        ]);
        res.json(activeChats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/support/read/:studentId
// @desc    Mark messages as read for a student
router.put('/read/:studentId', async (req, res) => {
    try {
        await SupportMessage.updateMany(
            { student: req.params.studentId, sender: 'student', isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ msg: 'Messages marked as read' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/support/end-chat/:studentId
// @desc    Delete chat history (Admin)
router.delete('/end-chat/:studentId', async (req, res) => {
    try {
        await SupportMessage.deleteMany({ student: req.params.studentId });
        res.json({ success: true, message: 'Chat history deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
