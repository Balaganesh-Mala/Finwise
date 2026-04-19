const express = require('express');
const router = express.Router();
const { 
    createSchedules, 
    getSchedules, 
    updateSchedule, 
    deleteSchedule 
} = require('../controllers/interviewScheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes are protected to Admin
router.post('/schedule', protect, admin, createSchedules);
router.get('/schedules', protect, getSchedules); // Both student and trainer can view
router.patch('/schedules/:id', protect, admin, updateSchedule);
router.delete('/schedules/:id', protect, admin, deleteSchedule);

module.exports = router;
