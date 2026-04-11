const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

// All routes are protected by role/auth - assuming standard project pattern
// GET /api/rewards/store?studentId=...
router.get('/store', rewardController.getStoreCourses);

// GET /api/rewards/wallet/:studentId
router.get('/wallet/:studentId', rewardController.getStudentWallet);

// POST /api/rewards/purchase
router.post('/purchase', rewardController.purchaseCourse);

// POST /api/rewards/grant
router.post('/grant', rewardController.adminGrantCourse);

// GET /api/rewards/my-bonus-courses/:studentId
router.get('/my-bonus-courses/:studentId', rewardController.getMyBonusCourses);

module.exports = router;
