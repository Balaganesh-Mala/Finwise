const express = require('express');
const router = express.Router();
const BatchStudent = require('../models/BatchStudent');
const Holiday = require('../models/Holiday');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const { countWorkingDays } = require('../services/dripService');

// @route   GET /api/drip/unlocked/:studentId/:courseId
// @desc    Get the list of unlocked topic IDs for a student in a course
// @access  Student
router.get('/unlocked/:studentId/:courseId', async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        // Get all modules and topics for this course
        const modules = await Module.find({ courseId }).sort({ order: 1 }).select('_id');
        const moduleIds = modules.map(m => m._id);
        const topics = await Topic.find({ moduleId: { $in: moduleIds } })
            .sort({ order: 1 })
            .select('_id unlockOrder title moduleId');

        const allTopicIds = topics.map(t => t._id.toString());

        // If no topics exist, return empty
        if (allTopicIds.length === 0) {
            return res.json({ success: true, unlockedTopicIds: [], unlockedCount: 0 });
        }

        // Check if any topics have unlockOrder assigned
        const hasUnlockOrder = topics.some(t => t.unlockOrder != null);

        // If no unlockOrder set at all → unlock ALL topics (drip not configured)
        if (!hasUnlockOrder) {
            return res.json({
                success: true,
                unlockedTopicIds: allTopicIds,
                unlockedCount: allTopicIds.length,
                reason: 'no_drip_configured'
            });
        }

        // Find student's batch enrollment for this course
        const enrollment = await BatchStudent.findOne({ studentId, courseId }).populate('batchId');

        // If no batch assigned → unlock ALL (don't block student)
        if (!enrollment) {
            return res.json({
                success: true,
                unlockedTopicIds: allTopicIds,
                unlockedCount: allTopicIds.length,
                reason: 'no_batch'
            });
        }

        // Use batch startDate as reference if enrollmentDate not explicitly set,
        // OR if enrollmentDate equals createdAt (auto-default), use batch startDate instead
        const batchStartDate = enrollment.batchId?.startDate;
        let referenceDate = enrollment.enrollmentDate;

        // If batch has a startDate and it's earlier than (or same as) today, prefer it
        if (batchStartDate) {
            const bStart = new Date(batchStartDate);
            bStart.setUTCHours(0, 0, 0, 0);
            const eDate = new Date(referenceDate);
            eDate.setUTCHours(0, 0, 0, 0);
            // Use whichever is earlier (batch start or enrollment date)
            if (bStart < eDate) {
                referenceDate = batchStartDate;
            }
        }

        // Fetch all holidays
        const holidays = await Holiday.find({}, 'date');
        const holidayDates = holidays.map(h => h.date);

        // Count working days since reference date
        const unlockedCount = countWorkingDays(referenceDate, holidayDates);

        // A topic is unlocked if its unlockOrder <= unlockedCount
        const unlockedTopicIds = topics
            .filter(t => t.unlockOrder != null && t.unlockOrder <= unlockedCount)
            .map(t => t._id.toString());

        // Always unlock at least the first topic (so student can start)
        const firstOrderedTopic = topics.filter(t => t.unlockOrder != null).sort((a, b) => a.unlockOrder - b.unlockOrder)[0];
        if (firstOrderedTopic && !unlockedTopicIds.includes(firstOrderedTopic._id.toString())) {
            unlockedTopicIds.unshift(firstOrderedTopic._id.toString());
        }

        res.json({
            success: true,
            unlockedTopicIds,
            unlockedCount,
            referenceDate,
            totalTopics: topics.length
        });
    } catch (err) {
        console.error('Drip Unlock Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   POST /api/drip/holiday
// @desc    Admin marks a date as a holiday (skip in drip unlock)
// @access  Admin
router.post('/holiday', async (req, res) => {
    try {
        const { date, reason } = req.body;
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const holiday = await Holiday.findOneAndUpdate(
            { date: new Date(date) },
            { date: new Date(date), reason: reason || '' },
            { upsert: true, new: true }
        );

        res.json({ success: true, holiday });
    } catch (err) {
        console.error('Mark Holiday Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/drip/holidays
// @desc    List all holidays
// @access  Admin
router.get('/holidays', async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json({ success: true, holidays });
    } catch (err) {
        console.error('List Holidays Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/drip/holiday/:id
// @desc    Remove a holiday
// @access  Admin
router.delete('/holiday/:id', async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Holiday removed' });
    } catch (err) {
        console.error('Delete Holiday Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/drip/set-unlock-order/:courseId
// @desc    Auto-assign unlockOrder to all topics in a course sequentially
// @access  Admin
router.post('/set-unlock-order/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        const modules = await Module.find({ courseId }).sort({ order: 1 });
        let order = 1;
        const updates = [];

        for (const mod of modules) {
            const topics = await Topic.find({ moduleId: mod._id }).sort({ order: 1 });
            for (const topic of topics) {
                updates.push(Topic.findByIdAndUpdate(topic._id, { unlockOrder: order }));
                order++;
            }
        }

        await Promise.all(updates);

        res.json({ success: true, message: `Assigned unlock order to ${order - 1} topics` });
    } catch (err) {
        console.error('Set Unlock Order Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/drip/unlock-order/:courseId
// @desc    Clear unlock order for all topics (disable drip lock)
// @access  Admin
router.delete('/unlock-order/:courseId', async (req, res) => {
    try {
        const modules = await Module.find({ courseId: req.params.courseId }).select('_id');
        const moduleIds = modules.map(m => m._id);
        await Topic.updateMany({ moduleId: { $in: moduleIds } }, { $set: { unlockOrder: null } });
        res.json({ success: true, message: 'Drip lock disabled — all topics are now accessible' });
    } catch (err) {
        console.error('Clear Unlock Order Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

