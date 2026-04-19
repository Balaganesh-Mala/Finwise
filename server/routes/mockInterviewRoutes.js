const express = require('express');
const router = express.Router();
const { 
    submitFeedback, 
    getStudentPerformance, 
    getInterviewHistory,
    getAllHistory,
    updateFeedback,
    deleteFeedback,
    downloadInterviewPDF
} = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');

// Download Route (Publicly accessible within portal constraints)
router.get('/download/:id', downloadInterviewPDF);

// Trainer Routes
router.post('/submit', protect, submitFeedback);

// Admin/Trainer: Get ALL global history
router.get('/all', getAllHistory);

// Admin: Edit and Delete specific feedbacks
router.put('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);

// studentId is passed in param for dashboard fetching
router.get('/student/:studentId', getStudentPerformance);

// Student History (Student Portal) - Note: Using studentId in query for now to match project pattern
router.get('/history/:studentId', getStudentPerformance); 

module.exports = router;
