const express = require('express');
const router = express.Router();
const mockInterviewSettingsController = require('../controllers/mockInterviewSettingsController');
const { protect, admin } = require('../middleware/authMiddleware'); // Optional guard

router.route('/')
    .get(mockInterviewSettingsController.getSettings)
    .put(mockInterviewSettingsController.updateSettings); // Assuming security is handled globally or add protect+authorize

module.exports = router;
