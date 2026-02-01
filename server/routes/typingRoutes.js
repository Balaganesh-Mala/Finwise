const express = require('express');
const router = express.Router();
const TypingProgress = require('../models/TypingProgress');

// Save typing progress
router.post('/save', async (req, res) => {
  try {
    const { studentId, wpm, accuracy, errors, mode, lesson, time } = req.body;

    if (!studentId || wpm === undefined || accuracy === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProgress = new TypingProgress({
      studentId,
      wpm,
      accuracy,
      errors,
      mode,
      lesson,
      time
    });

    const savedProgress = await newProgress.save();
    res.status(201).json(savedProgress);
    
  } catch (error) {
    console.error('Error saving typing progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student history
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await TypingProgress.find({ studentId }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    console.error('Error fetching typing history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Analytics (Aggregate data)
router.get('/analytics', async (req, res) => {
  try {
    // Top 10 fastest modes
    const topSpeeds = await TypingProgress.find().sort({ wpm: -1 }).limit(10);
    
    // Average WPM across all tests
    const avgStats = await TypingProgress.aggregate([
      {
        $group: {
          _id: null,
          avgWpm: { $avg: '$wpm' },
          avgAccuracy: { $avg: '$accuracy' },
          totalTests: { $sum: 1 }
        }
      }
    ]);

    res.json({
      topSpeeds,
      stats: avgStats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
