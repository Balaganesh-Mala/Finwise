const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Inquiry = require('../models/Inquiry');
const Job = require('../models/Job');
const Student = require('../models/Student');

// @route   GET /api/analytics
// @desc    Get dashboard analytics stats
// @access  Public (should be protected in production)
router.get('/', async (req, res) => {
    try {
        // Parallelize database calls for performance
        const [
            activeCourses,
            activeJobs,
            newInquiries,
            totalInquiries,
            recentInquiries,
            totalStudents
        ] = await Promise.all([
            Course.countDocuments({}),
            Job.countDocuments({ isActive: true }),
            Inquiry.countDocuments({ status: 'new' }),
            Inquiry.countDocuments({}),
            Inquiry.find().sort({ createdAt: -1 }).limit(5),
            Student.countDocuments({})
        ]);

        // Aggregation for Charts
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [
            monthlyInquiries,
            courseInterest
        ] = await Promise.all([
            // Inquiries over time (last 6 months)
            Inquiry.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            // Course Popularity
            Inquiry.aggregate([
                { $match: { courseInterested: { $exists: true, $ne: null } } },
                {
                    $group: {
                        _id: "$courseInterested",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                activeCourses,
                activeJobs,
                newInquiries,
                totalInquiries,
                recentInquiries,
                monthlyInquiries,
                courseInterest
            }
        });

    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
