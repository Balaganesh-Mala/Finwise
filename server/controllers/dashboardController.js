const Student = require('../models/Student');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Attendance = require('../models/Attendance');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const BatchStudent = require('../models/BatchStudent');

// @desc    Get Student Dashboard Statistics
// @route   GET /api/students/dashboard/:studentId
// @access  Student
exports.getStudentDashboardStats = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Fetch Student Details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // ─── 2. Enrolled Courses Count ───────────────────────────────────────────
        // Count unique courseIds across all Progress records (reliable — no string matching)
        const distinctCourseIds = await Progress.distinct('courseId', { studentId });
        const enrolledCoursesCount = distinctCourseIds.length || (student.courseName ? 1 : 0);

        // ─── 3. Hours Learned (use topic.duration, NOT watchedDuration) ──────────
        // watchedDuration is 0 for YouTube embeds and manually-marked topics.
        // Instead, sum the duration (minutes) of all completed topics and convert to hours.
        const completedProgress = await Progress.find({ studentId, completed: true })
            .populate({ path: 'topicId', select: 'duration title' })
            .populate({ path: 'courseId', select: 'title' });

        const totalMinutes = completedProgress.reduce((acc, p) => {
            return acc + (p.topicId?.duration || 0);
        }, 0);
        const hoursLearned = (totalMinutes / 60).toFixed(1);

        // ─── 4. Attendance Count ─────────────────────────────────────────────────
        const attendanceCount = await Attendance.countDocuments({
            studentId: studentId,
            status: 'present'
        });

        // ─── 5. Recent Activity (Last 5 completed topics) ────────────────────────
        // Sort by completedAt desc; fall back to updatedAt if completedAt is null
        const recentProgress = await Progress.find({ studentId, completed: true })
            .sort({ completedAt: -1, updatedAt: -1 })
            .limit(5)
            .populate({ path: 'topicId', select: 'title' })
            .populate({ path: 'courseId', select: 'title' });

        const recentActivity = recentProgress.map(p => ({
            id: p._id,
            topic: p.topicId?.title || 'Unknown Topic',
            course: p.courseId?.title || student.courseName || 'Course',
            date: p.completedAt || p.updatedAt
        }));

        // ─── 6. Batch Progress (% of topics completed) ───────────────────────────
        // Use BatchStudent for reliable courseId lookup instead of courseName regex.
        let batchProgress = 0;
        try {
            // Try BatchStudent first (reliable)
            const enrollment = await BatchStudent.findOne({ studentId }).populate('courseId');
            let courseId = enrollment?.courseId?._id;

            // Fallback: use Progress distinct courseIds if batch not found
            if (!courseId && distinctCourseIds.length > 0) {
                courseId = distinctCourseIds[0];
            }

            // Last resort fallback: courseName string match
            if (!courseId && student.courseName) {
                const course = await Course.findOne({
                    title: { $regex: new RegExp(student.courseName, 'i') }
                });
                courseId = course?._id;
            }

            if (courseId) {
                const modules = await Module.find({ courseId }).select('_id');
                const moduleIds = modules.map(m => m._id);
                const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
                const completedTopics = await Progress.countDocuments({
                    studentId,
                    courseId,
                    completed: true
                });
                if (totalTopics > 0) {
                    batchProgress = Math.min(100, Math.round((completedTopics / totalTopics) * 100));
                }
            }
        } catch (batchErr) {
            console.error('Batch progress calculation error:', batchErr);
        }

        // ─── 7. Weekly Activity Chart (Mon–Sun) ──────────────────────────────────
        // Use Mongoose updatedAt (always set) instead of completedAt (often null).
        // Accumulate topic.duration (minutes → hours) per day.
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday
        const diffToMon = (dayOfWeek + 6) % 7;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        // Fetch completed progress this week, with topic durations
        const weeklyProgressDocs = await Progress.find({
            studentId,
            completed: true,
            updatedAt: { $gte: startOfWeek }
        }).populate({ path: 'topicId', select: 'duration' });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        weeklyProgressDocs.forEach(p => {
            // Use completedAt if set, otherwise fall back to updatedAt
            const recordDate = p.completedAt || p.updatedAt;
            if (recordDate) {
                const dayName = dayNames[new Date(recordDate).getDay()];
                const mins = p.topicId?.duration || 0;
                activityMap[dayName] = (activityMap[dayName] || 0) + (mins / 60);
            }
        });

        const weeklyActivity = [
            { name: 'Mon', hours: parseFloat(activityMap['Mon'].toFixed(2)) },
            { name: 'Tue', hours: parseFloat(activityMap['Tue'].toFixed(2)) },
            { name: 'Wed', hours: parseFloat(activityMap['Wed'].toFixed(2)) },
            { name: 'Thu', hours: parseFloat(activityMap['Thu'].toFixed(2)) },
            { name: 'Fri', hours: parseFloat(activityMap['Fri'].toFixed(2)) },
            { name: 'Sat', hours: parseFloat(activityMap['Sat'].toFixed(2)) },
            { name: 'Sun', hours: parseFloat(activityMap['Sun'].toFixed(2)) },
        ];

        res.json({
            success: true,
            stats: {
                enrolledCourses: enrolledCoursesCount,
                hoursLearned,          // now uses topic.duration, not watchedDuration
                attendance: attendanceCount,
                batchProgress,         // now uses BatchStudent courseId lookup
                certificates: 0        // placeholder
            },
            recentActivity,
            weeklyActivity
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Student Leaderboard (Top 10 of the week by topic duration)
// @route   GET /api/students/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const today = new Date();
        const diffToMon = (today.getDay() + 6) % 7;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        // Aggregate completed topics this week, join topic duration
        // We use $lookup to get topic duration since watchedDuration is unreliable for YouTube
        const leaderboard = await Progress.aggregate([
            {
                $match: {
                    completed: true,
                    updatedAt: { $gte: startOfWeek }
                }
            },
            {
                // Join with topics to get their duration
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic'
                }
            },
            {
                $unwind: {
                    path: '$topic',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$studentId',
                    // Sum topic durations (minutes); fall back to watchedDuration if no topic duration
                    totalMinutes: {
                        $sum: {
                            $cond: [
                                { $gt: ['$topic.duration', 0] },
                                '$topic.duration',
                                { $divide: [{ $ifNull: ['$watchedDuration', 0] }, 60] }
                            ]
                        }
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
            {
                $unwind: {
                    path: '$studentInfo',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: 1,
                    name: '$studentInfo.name',
                    email: '$studentInfo.email',
                    totalHours: { $divide: ['$totalMinutes', 60] }
                }
            },
            { $sort: { totalHours: -1 } },
            { $limit: 10 }
        ]);

        const formattedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            id: entry._id,
            name: entry.name,
            email: entry.email,
            hours: entry.totalHours ? parseFloat(entry.totalHours.toFixed(1)) : 0
        }));

        res.json({ success: true, leaderboard: formattedLeaderboard });

    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get time-range activity data for dashboard chart (Week / Month / Year)
// @route   GET /api/students/activity/:studentId?range=week|month|year
// @access  Student
exports.getStudentActivity = async (req, res) => {
    try {
        const { studentId } = req.params;
        const range = req.query.range || 'week'; // default: week

        const now = new Date();
        let startDate;
        let chartData = [];

        // ── Determine date range boundaries ──────────────────────────────────────
        if (range === 'week') {
            // Monday of current week
            const diffToMon = (now.getDay() + 6) % 7;
            startDate = new Date(now);
            startDate.setDate(now.getDate() - diffToMon);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'month') {
            // 1st of current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        } else if (range === 'year') {
            // Jan 1st of current year
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        } else {
            return res.status(400).json({ message: 'Invalid range. Use week, month, or year.' });
        }

        // ── Fetch completed progress records in the period ────────────────────────
        const progressDocs = await Progress.find({
            studentId,
            completed: true,
            updatedAt: { $gte: startDate }
        }).populate({ path: 'topicId', select: 'duration' });

        // ── Build chart buckets ───────────────────────────────────────────────────
        if (range === 'week') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const map = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

            progressDocs.forEach(p => {
                const d = new Date(p.completedAt || p.updatedAt);
                const dayName = dayNames[d.getDay()];
                map[dayName] = (map[dayName] || 0) + ((p.topicId?.duration || 0) / 60);
            });

            chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
                name,
                hours: parseFloat((map[name] || 0).toFixed(2))
            }));

        } else if (range === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const map = new Array(daysInMonth).fill(0);

            progressDocs.forEach(p => {
                const d = new Date(p.completedAt || p.updatedAt);
                const dayIndex = d.getDate() - 1; // 0-indexed
                if (dayIndex >= 0 && dayIndex < daysInMonth) {
                    map[dayIndex] += (p.topicId?.duration || 0) / 60;
                }
            });

            chartData = map.map((hours, i) => ({
                name: String(i + 1),
                hours: parseFloat(hours.toFixed(2))
            }));

        } else if (range === 'year') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const map = new Array(12).fill(0);

            progressDocs.forEach(p => {
                const d = new Date(p.completedAt || p.updatedAt);
                const monthIndex = d.getMonth(); // 0–11
                map[monthIndex] += (p.topicId?.duration || 0) / 60;
            });

            chartData = map.map((hours, i) => ({
                name: monthNames[i],
                hours: parseFloat(hours.toFixed(2))
            }));
        }

        // ── Period summary stats ──────────────────────────────────────────────────
        const totalMinutes = progressDocs.reduce((acc, p) => acc + (p.topicId?.duration || 0), 0);
        const totalHours = parseFloat((totalMinutes / 60).toFixed(1));
        const topicCount = progressDocs.length;

        // Count unique active days
        const activeDaySet = new Set(
            progressDocs.map(p => {
                const d = new Date(p.completedAt || p.updatedAt);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );
        const activeDays = activeDaySet.size;

        res.json({
            success: true,
            range,
            chartData,
            summary: {
                totalHours,
                topicCount,
                activeDays
            }
        });

    } catch (err) {
        console.error('Error fetching student activity:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
