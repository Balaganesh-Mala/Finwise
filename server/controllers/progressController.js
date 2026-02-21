const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Student = require('../models/Student');

// @desc    Update progress for a topic
// @route   POST /api/student/progress/update
// @access  Student
exports.updateProgress = async (req, res) => {
    try {
        const { studentId, courseId, topicId, completed, watchedDuration } = req.body;

        if (!studentId || !topicId || !courseId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Upsert progress
        let progress = await Progress.findOne({ studentId, topicId });

        if (progress) {
            if (completed !== undefined) progress.completed = completed;
            if (watchedDuration !== undefined) progress.watchedDuration = watchedDuration;
            if (completed && !progress.completedAt) progress.completedAt = Date.now();
        } else {
            progress = new Progress({
                studentId,
                courseId,
                topicId,
                completed: completed || false,
                watchedDuration: watchedDuration || 0,
                completedAt: completed ? Date.now() : undefined
            });
        }

        await progress.save();

        // --- NEW: Calculate & Update Overall Course Progress Percentage for Student ---
        try {
            // 1. Get Total Topics in Course
            const modules = await Module.find({ courseId });
            const moduleIds = modules.map(m => m._id);
            const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

            // 2. Get Completed Topics for Student in this Course
            const completedCount = await Progress.countDocuments({ 
                studentId, 
                courseId, 
                completed: true 
            });

            // 3. Calculate Percentage
            let percentage = 0;
            if (totalTopics > 0) {
                percentage = Math.round((completedCount / totalTopics) * 100);
            }
            percentage = Math.min(percentage, 100);

            // 4. Update Student Record
            await Student.findByIdAndUpdate(studentId, { progress: percentage });
            console.log(`Updated Student ${studentId} progress to ${percentage}%`);

        } catch (calcErr) {
            console.error("Error updating student overall progress:", calcErr);
            // Don't fail the request, just log error
        }
        // --------------------------------------------------------------------------

        res.json({ success: true, progress });

    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get progress for a course
// @route   GET /api/student/progress/:courseId/:studentId
// @access  Student
exports.getCourseProgress = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        const progress = await Progress.find({ courseId, studentId });
        res.json({ success: true, progress });
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get student completion stats (percentage)
// @route   GET /api/student/progress/stats/:studentId
// @access  Student
exports.getStudentCompletionStats = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Find the most recent courseId this student has progress records for
        //    (CoursePlayer always stores the real courseId ObjectId from the URL)
        const latestProgress = await Progress.findOne({ studentId })
            .sort({ updatedAt: -1 })
            .select('courseId');

        if (!latestProgress) {
            return res.json({
                success: true,
                stats: {
                    completionPercentage: 0,
                    completedTopics: 0,
                    totalTopics: 0,
                    enrolled: false
                }
            });
        }

        const courseId = latestProgress.courseId;

        // 2. Count total topics in the course
        const modules = await Module.find({ courseId });
        const moduleIds = modules.map(m => m._id);
        const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

        // 3. Count completed topics for this student in this course
        const completedTopics = await Progress.countDocuments({
            studentId,
            courseId,
            completed: true
        });

        // 4. Calculate percentage
        const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

        // 5. Get course name for display
        const course = await Course.findById(courseId).select('title');

        res.json({
            success: true,
            stats: {
                completionPercentage: percentage,
                completedTopics,
                totalTopics,
                enrolled: true,
                courseName: course?.title || ''
            }
        });

    } catch (err) {
        console.error('Error calculating completion stats:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Check if student is eligible to apply for jobs (>= 75% completion)
// @route   GET /api/students/:studentId/eligibility
// @access  Student
exports.getEligibility = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Derive courseId from the student's own Progress records
        const latestProgress = await Progress.findOne({ studentId })
            .sort({ updatedAt: -1 })
            .select('courseId');

        if (!latestProgress) {
            return res.json({ eligible: false, completion: 0 });
        }

        const courseId = latestProgress.courseId;

        const modules = await Module.find({ courseId });
        const moduleIds = modules.map(m => m._id);
        const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

        const completedTopics = await Progress.countDocuments({
            studentId,
            courseId,
            completed: true
        });

        const completion = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
        const eligible = completion >= 75;

        res.json({ eligible, completion });
    } catch (err) {
        console.error('Error checking eligibility:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
