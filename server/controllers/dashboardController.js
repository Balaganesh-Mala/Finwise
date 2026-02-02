const Student = require('../models/Student');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Attendance = require('../models/Attendance');

// @desc    Get Student Dashboard Statistics
// @route   GET /api/student/dashboard/:studentId
// @access  Student
exports.getStudentDashboardStats = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Fetch Student Details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 2. Calculate Enrolled Courses (Based on courseName for now)
        let enrolledCoursesCount = 0;
        let totalCourseDurationDays = 90; // Default
        if (student.courseName) {
            enrolledCoursesCount = 1; 
            // Optional: Fetch course to get exact duration, but for summary 1 is fine if name exists
            const course = await Course.findOne({ title: { $regex: student.courseName, $options: 'i' } });
            if (course && course.duration) {
                // Parse duration for "Days Remaining" calculation if needed
                // logic similar to MyCourses
            }
        }

        // 3. Calculate Hours Learned (Total Watched Duration)
        // observedDuration is in seconds
        const progressDocs = await Progress.find({ studentId: studentId });
        const totalSeconds = progressDocs.reduce((acc, curr) => acc + (curr.watchedDuration || 0), 0);
        const hoursLearned = (totalSeconds / 3600).toFixed(1); // Convert to Hours with 1 decimal

        // 4. Attendance Count
        const attendanceCount = await Attendance.countDocuments({ studentId: studentId, status: 'present' });

        // 5. Recent Activity (Last 5 completed topics)
        // We need to populate topic details. 
        // Note: Progress model has topicId. We assume Topic model exists to populate title.
        // If Topic model is not imported, let's just send basic info or try to populate if Topic model was imported.
        // Let's import Topic model dynamically or just rely on what we have.
        // Assuming Topic model is 'Topic'
        const recentProgress = await Progress.find({ studentId: studentId, completed: true })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate({ path: 'topicId', select: 'title' }) 
            .populate({ path: 'courseId', select: 'title' });

        const recentActivity = recentProgress.map(p => ({
            id: p._id,
            topic: p.topicId?.title || 'Unknown Topic',
            course: p.courseId?.title || student.courseName || 'Course',
            date: p.completedAt
        }));

        // 6. Calculate Average Progress (Batch Based)
        let batchProgress = 0;
        if (student.startDate) {
            const start = new Date(student.startDate);
            const today = new Date();
            const diffTime = Math.abs(today - start);
            const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const totalDays = 90; // Default or fetch from course
            batchProgress = Math.min(100, Math.round((daysPassed / totalDays) * 100));
        }

        // 7. Calculate Weekly Activity (Mon-Sun)
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        const day = startOfWeek.getDay(); // 0 is Sunday
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff); // Set to Monday

        const weeklyProgressDocs = await Progress.find({
            studentId,
            completedAt: { $gte: startOfWeek }
        });

        const activityMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        weeklyProgressDocs.forEach(p => {
            if (p.completedAt) {
                const d = new Date(p.completedAt);
                const dayName = days[d.getDay()];
                const hours = (p.watchedDuration || 0) / 3600;
                activityMap[dayName] += hours;
            }
        });

        // Convert Map to Array for Recharts
        const weeklyActivity = [
            { name: 'Mon', hours: parseFloat(activityMap['Mon'].toFixed(1)) },
            { name: 'Tue', hours: parseFloat(activityMap['Tue'].toFixed(1)) },
            { name: 'Wed', hours: parseFloat(activityMap['Wed'].toFixed(1)) },
            { name: 'Thu', hours: parseFloat(activityMap['Thu'].toFixed(1)) },
            { name: 'Fri', hours: parseFloat(activityMap['Fri'].toFixed(1)) },
            { name: 'Sat', hours: parseFloat(activityMap['Sat'].toFixed(1)) },
            { name: 'Sun', hours: parseFloat(activityMap['Sun'].toFixed(1)) }
        ];

        res.json({
            success: true,
            stats: {
                enrolledCourses: enrolledCoursesCount,
                hoursLearned: hoursLearned,
                attendance: attendanceCount,
                batchProgress: batchProgress,
                certificates: 0 // Placeholder until Certificate system
            },
            recentActivity,
            weeklyActivity // Add this
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
