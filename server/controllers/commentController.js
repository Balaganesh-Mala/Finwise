const Comment = require('../models/Comment');

// @desc    Add a comment (or doubt)
// @route   POST /api/student/comment/add
// @access  Student
exports.addComment = async (req, res) => {
    try {
        const { topicId, studentId, message, rating } = req.body;

        if (!topicId || !studentId || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const comment = await Comment.create({
            topicId,
            studentId,
            message,
            rating
        });

        // Populate student info for immediate return
        await comment.populate('studentId', 'name');

        res.status(201).json({ success: true, comment });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get comments for a topic
// @route   GET /api/student/comment/:topicId
// @access  Public
exports.getCommentsByTopic = async (req, res) => {
    try {
        const comments = await Comment.find({ topicId: req.params.topicId })
            .populate('studentId', 'name') // Only fetch name
            .sort({ createdAt: -1 });

        res.json({ success: true, count: comments.length, comments });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Delete a comment (Admin or Owner)
// @route   DELETE /api/comment/:commentId
// @access  Public (Protected via logic)
exports.deleteComment = async (req, res) => {
    try {
        const { studentId } = req.body; // Pass studentId if student is deleting
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership if studentId is provided (Student Delete)
        if (studentId && comment.studentId.toString() !== studentId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Update a comment
// @route   PUT /api/comment/:commentId
// @access  Public (Protected via logic)
exports.updateComment = async (req, res) => {
    try {
        const { studentId, message } = req.body;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership
        if (comment.studentId.toString() !== studentId) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        comment.message = message || comment.message;
        await comment.save();

        // return populated comment
        await comment.populate('studentId', 'name');

        res.json({ success: true, comment });
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
