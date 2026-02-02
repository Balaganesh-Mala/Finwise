const express = require('express');
const router = express.Router();
const { updateProgress, getCourseProgress } = require('../controllers/progressController');

// Standard routes for student
router.post('/student/progress/update', updateProgress);
router.get('/student/progress/:courseId/:studentId', getCourseProgress);

module.exports = router;
