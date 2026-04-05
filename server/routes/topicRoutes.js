const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    createTopic, 
    getTopicsByModule, 
    updateTopic, 
    deleteTopic,
    deleteTopicNote
} = require('../controllers/topicController');

// Configure Multer (copied from courseRoutes for consistency)
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB video limit
});

// Configure Fields for Upload
const cpUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 10 }
]);

// Auth Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Admin Routes (Secured)
// Admin Routes (Secured)
router.post('/admin/topic/create', protect, admin, cpUpload, createTopic);
router.put('/admin/topic/:id', protect, admin, cpUpload, updateTopic);
router.delete('/admin/topic/:id', protect, admin, deleteTopic);
router.delete('/admin/topic/:id/note/:noteId', protect, admin, deleteTopicNote);

// Trainer Routes (Secured)
router.post('/trainer/topic/create', protect, cpUpload, createTopic);
router.put('/trainer/topic/:id', protect, cpUpload, updateTopic);
router.delete('/trainer/topic/:id', protect, deleteTopic);
router.delete('/trainer/topic/:id/note/:noteId', protect, deleteTopicNote);

// Public / Student Routes
router.get('/topics/:moduleId', getTopicsByModule); 

module.exports = router;
