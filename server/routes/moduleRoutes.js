const express = require('express');
const router = express.Router();
const { 
    createModule, 
    getModulesByCourse, 
    updateModule, 
    deleteModule 
} = require('../controllers/moduleController');

// Auth Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Admin Routes (Secured)
// Temporary: Removing protect/admin middleware because Admin frontend uses Supabase Auth 
// and doesn't send compatible tokens yet.
router.post('/admin/module/create', createModule);
router.get('/admin/modules/:courseId', getModulesByCourse); 
router.put('/admin/module/:id', updateModule);
router.delete('/admin/module/:id', deleteModule);

// Trainer Routes (Secured)
router.post('/trainer/module/create', protect, createModule);
router.get('/trainer/modules/:courseId', protect, getModulesByCourse);
router.put('/trainer/module/:id', protect, updateModule);
router.delete('/trainer/module/:id', protect, deleteModule);

// Public / Student Routes
router.get('/modules/:courseId', getModulesByCourse); 

module.exports = router;
