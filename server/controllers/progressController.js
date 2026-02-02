const Progress = require('../models/Progress');

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
