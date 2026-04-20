const express = require('express');
const router = express.Router();
const { 
    createMaterial, 
    getAllMaterials, 
    deleteMaterial, 
    getStudentMaterials,
    proxyPdf
} = require('../controllers/studyMaterialController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Admin Routes
router.post('/', admin, createMaterial);
router.get('/', admin, getAllMaterials);
router.delete('/:id', admin, deleteMaterial);

// Student Routes
router.get('/student/:studentId', getStudentMaterials);
router.get('/proxy-pdf', proxyPdf);

module.exports = router;
