const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Inquiry = require('../models/Inquiry');
const Job = require('../models/Job');
const supabaseAdmin = require('../config/supabase');

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
            recentInquiries
        ] = await Promise.all([
            Course.countDocuments({}),
            Job.countDocuments({ isActive: true }),
            Inquiry.countDocuments({ status: 'new' }),
            Inquiry.countDocuments({}),
            Inquiry.find().sort({ createdAt: -1 }).limit(5)
        ]);

        // Fetch User count from Supabase
        let totalStudents = 0;
        try {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
            if (!error && users) {
                totalStudents = users.length;
            }
        } catch (supabaseError) {
            console.error('Supabase Analytics Error:', supabaseError);
            // Fallback to 0 or handled gracefully
        }

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
