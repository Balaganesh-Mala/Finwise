const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const { loginTrainer, getMe } = require('../controllers/trainerAuthController');
const { 
    getExamStatus, submitMCQ, saveVideo, saveAssignment, submitWritten, submitExam 
} = require('../controllers/trainerHiringController');
const { 
    getDashboardStats, getClasses, createClass, markAttendance, getStudents, getTrainerCourses
} = require('../controllers/trainerPortalController');

// Configure Multer
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit (Video)
});

// Helper: Upload to Cloudinary
const uploadToCloudinary = async (filePath, folder, resourceType = 'auto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true
        });
        fs.unlinkSync(filePath);
        return result;
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
};

// Upload Endpoint
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        // Determine resource type based on mimetype
        const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'auto';
        const folder = req.file.mimetype.startsWith('video') ? 'trainer_videos' : 'trainer_assignments';

        const result = await uploadToCloudinary(req.file.path, folder, resourceType);
        
        res.json({ 
            success: true, 
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        console.error("Upload Error", err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Auth
router.post('/auth/login', loginTrainer);
router.post('/auth/request-reset', require('../controllers/trainerAuthController').requestPasswordReset);
router.post('/auth/reset-password', require('../controllers/trainerAuthController').resetPassword);
router.get('/auth/me', protect, getMe);

// Hiring / Exam (Protected - Applicant)
router.get('/exam/status', protect, getExamStatus);
router.post('/exam/mcq/submit', protect, submitMCQ);
router.post('/exam/video/save', protect, saveVideo);
router.post('/exam/assignment/save', protect, saveAssignment);
router.post('/exam/written/submit', protect, submitWritten);
router.post('/exam/submit', protect, submitExam);

// Portal (Protected - Employee)
router.get('/dashboard', protect, getDashboardStats);
router.get('/classes', protect, getClasses);
router.post('/classes', protect, createClass);
router.get('/students', protect, getStudents);
router.get('/courses', protect, getTrainerCourses);
router.post('/attendance/mark', protect, markAttendance);

module.exports = router;
