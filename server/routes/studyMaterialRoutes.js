const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    createMaterial, 
    getAllMaterials, 
    updateMaterial,
    deleteMaterial, 
    getStudentMaterials,
    proxyPdf
} = require('../controllers/studyMaterialController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Multer for Study Materials (Files and Thumbnails)
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes are protected
router.use(protect);

// Admin Routes
router.post('/', admin, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), createMaterial);

router.put('/:id', admin, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), updateMaterial);

router.get('/', admin, getAllMaterials);
router.delete('/:id', admin, deleteMaterial);

// Student Routes
router.get('/student/:studentId', getStudentMaterials);
router.get('/proxy-pdf', proxyPdf);

module.exports = router;
