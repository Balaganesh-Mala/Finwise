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

// Routes
router.post('/admin/topic/create', cpUpload, createTopic);
router.get('/topics/:moduleId', getTopicsByModule); // Public/Student
router.put('/admin/topic/:id', cpUpload, updateTopic);
router.delete('/admin/topic/:id', deleteTopic);
router.delete('/admin/topic/:id/note/:noteId', deleteTopicNote);

module.exports = router;
