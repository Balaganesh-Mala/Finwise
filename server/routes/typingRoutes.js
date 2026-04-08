const express = require('express');
const router = express.Router();
const TypingProgress = require('../models/TypingProgress');
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
    const newProgress = new TypingProgress({ studentId, wpm, accuracy, errorCount: errors, mode, lesson, time });
    const savedProgress = await newProgress.save();

    // Award points and handle level progression if WPM >= 35
    if (wpm >= 35) {
      const student = await Student.findById(studentId);
      if (student) {
        // Award 100 points
        student.points = (student.points || 0) + 100;
        
        // Progression mapping based on current typing lessons
        // 1: beginner, 2: intermediate, 3: advanced, 4: office, 5: dataEntry
        const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'office': 4, 'dataEntry': 5 };
        const currentCategoryLevel = levelMap[mode] || 1; // Assuming mode or lesson helps identify

        // Simple progression: if they beat a level with 35+ WPM, we can increment their global typingLevel
        // For simplicity, let's just use a threshold
        if (student.typingLevel < 5) {
           student.typingLevel += 1;
        }

        // Persist lesson progress
        // Calculate next lesson index
        const totalLessonsInCat = 6; // Current lessonLessons structure has roughly 4-6
        let nextIndex = (student.lastLessonIndex || 0) + 1;
        
        // If they finish the current category, maybe reset index and stay in same for now or handle category change
        student.lastLessonIndex = nextIndex;
        student.lastCategory = mode || 'beginner'; // mode is 'beginner', 'intermediate' etc.

        await student.save();
      }
    }

    res.status(201).json(savedProgress);
  } catch (error) {
    console.error('Error saving typing progress:', error);
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
