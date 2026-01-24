const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/runController');

// POST /api/run
// Body: { language, code, stdin }
router.post('/', runCode);

module.exports = router;
