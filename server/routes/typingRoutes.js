const express = require('express');
const router = express.Router();
const TypingProgress = require('../models/TypingProgress');
const TypingHistory = require('../models/TypingHistory');
const Student = require('../models/Student');
const {
  saveTypingResult,
  getTypingHistory,
  getLastResult,
  getLessons,
  getLessonById
} = require('../controllers/typingController');

// ── Legacy Routes (backward compatible with TypingPractice.jsx) ────────────────

router.post('/save', async (req, res) => {
  try {
    const { studentId, wpm, accuracy, errors, mode, lesson, time } = req.body;
    if (!studentId || wpm === undefined || accuracy === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const currentMode = mode || 'beginner';
    const currentLesson = lesson || 'Free Typing';

    let pointsAwarded = 0;
    let isFirstCompletion = false;

    // Check for points condition BEFORE saving (cleaner logic)
    if (accuracy > 95 && wpm >= 35) {
      // Check if student already has a session for this lesson with >95% accuracy AND 35+ WPM
      const previousSuccessful = await TypingHistory.findOne({
        studentId,
        mode: currentMode,
        lessonTitle: currentLesson,
        accuracy: { $gt: 95 },
        wpm: { $gte: 35 }
      });

      if (!previousSuccessful) {
        isFirstCompletion = true;
        const pointMap = { 
            'beginner': 20, 
            'intermediate': 50, 
            'advanced': 100,
            'office': 70,
            'dataEntry': 70,
            'numbers': 70
        };
        pointsAwarded = pointMap[currentMode] || 0;
        
        if (pointsAwarded > 0) {
          await Student.findByIdAndUpdate(studentId, {
            $inc: { points: pointsAwarded }
          });
        }
      }
    }

    // Save to legacy TypingProgress model
    const newProgress = new TypingProgress({ 
        studentId, wpm, accuracy, errorCount: errors, 
        mode: currentMode, lesson: currentLesson, time,
        pointsAwarded: pointsAwarded
    });
    const savedProgress = await newProgress.save();

    // Mirror to modern history model
    try {
        await new TypingHistory({
            studentId, wpm, accuracy, 
            mode: currentMode, lessonTitle: currentLesson, duration: time,
            incorrectChars: errors || 0
        }).save();
    } catch (historyErr) {
        console.error('Modern history mirror failed:', historyErr);
        // Non-critical, continue
    }

    res.status(201).json({
        ...savedProgress.toObject(),
        pointsAwarded,
        isFirstCompletion,
        accuracyThresholdMet: accuracy > 95 && wpm >= 35
    });
  } catch (error) {
    console.error('Error saving typing progress (legacy):', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

router.get('/analytics', async (req, res) => {
  try {
    const topSpeeds = await TypingProgress.find().sort({ wpm: -1 }).limit(10);
    const avgStats  = await TypingProgress.aggregate([
      { $group: { _id: null, avgWpm: { $avg: '$wpm' }, avgAccuracy: { $avg: '$accuracy' }, totalTests: { $sum: 1 } } }
    ]);
    res.json({ topSpeeds, stats: avgStats[0] || {} });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── New Routes (TypingTrainer — uses TypingHistory model) ──────────────────────

router.post('/submit',              saveTypingResult);   // rich per-key errors
router.get('/sessions/:studentId',  getTypingHistory);   // paginated + summary
router.get('/last/:studentId',      getLastResult);      // last + personal best
router.get('/lessons',              getLessons);         // full lesson list
router.get('/lesson/:id',           getLessonById);      // single lesson

module.exports = router;
