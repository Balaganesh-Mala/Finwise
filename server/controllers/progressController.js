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

        // 1. Get Student to find enrolled course
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!student.courseName) {
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

        // 2. Find Course by Name (assuming courseName matches title roughly, or use ID if available in future)
        // Ideally Student model should have courseId. checks below
        const course = await Course.findOne({ title: { $regex: student.courseName, $options: 'i' } });
        
        if (!course) {
             return res.json({ 
                success: true, 
                stats: { 
                     completionPercentage: 0,
                     completedTopics: 0,
                     totalTopics: 0,
                     message: "Course not found"
                } 
            });
        }

        // 3. Count Total Topics in the Course
        // Course -> Modules -> Topics
        const modules = await Module.find({ courseId: course._id });
        const moduleIds = modules.map(m => m._id);
        const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

        // 4. Count Completed Topics for the Student in this Course
        const completedTopics = await Progress.countDocuments({ 
            studentId, 
            courseId: course._id, 
            completed: true 
        });

        // 5. Calculate Percentage
        const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

        res.json({
            success: true,
            stats: {
                completionPercentage: percentage,
                completedTopics,
                totalTopics,
                enrolled: true,
                courseName: course.title
            }
        });

    } catch (err) {
        console.error('Error calculating completion stats:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
