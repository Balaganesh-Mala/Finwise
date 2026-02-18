const express = require('express');
const router = express.Router();
const { updateProgress, getCourseProgress, getStudentCompletionStats } = require('../controllers/progressController');

// Standard routes for student
router.post('/student/progress/update', updateProgress);
router.get('/student/progress/:courseId/:studentId', getCourseProgress);
router.get('/student/progress/stats/:studentId', getStudentCompletionStats);

module.exports = router;
