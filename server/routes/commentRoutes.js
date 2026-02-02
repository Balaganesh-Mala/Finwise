const express = require('express');
const router = express.Router();
const { addComment, getCommentsByTopic, deleteComment } = require('../controllers/commentController');

// Routes
router.post('/student/comment/add', addComment);
router.get('/student/comment/:topicId', getCommentsByTopic);
router.delete('/comment/:commentId', deleteComment); // Shared delete (Admin or Student via body check)
router.put('/comment/:commentId', require('../controllers/commentController').updateComment); // Update

module.exports = router;
