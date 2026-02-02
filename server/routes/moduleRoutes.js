const express = require('express');
const router = express.Router();
const { 
    createModule, 
    getModulesByCourse, 
    updateModule, 
    deleteModule 
} = require('../controllers/moduleController');

// All routes are prefixed with /api/admin (based on server.js mounting, likely /api)
// Actually, let's look at how we mount it. 
// Standard pattern: 
// POST /api/modules/create
// GET /api/modules/course/:courseId

router.post('/admin/module/create', createModule);
router.get('/admin/modules/:courseId', getModulesByCourse); // Admin side
router.get('/modules/:courseId', getModulesByCourse); // Student side (public or protected)
router.put('/admin/module/:id', updateModule);
router.delete('/admin/module/:id', deleteModule);

module.exports = router;
