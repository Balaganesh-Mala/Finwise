const TypingHistory = require('../models/TypingHistory');
const TypingProgress = require('../models/TypingProgress');
const Student = require('../models/Student');

// ── POST /api/typing/submit ────────────────────────────────────────────────────
const saveTypingResult = async (req, res) => {
  try {
    const {
      studentId,
      mode,
      lessonTitle,
      wpm,
      accuracy,
      duration,
      correctChars,
      incorrectChars,
      errors   // { a: 3, s: 1, k: 12 }
    } = req.body;

    const currentMode = mode || 'beginner';
    const currentLesson = lessonTitle || 'Free Typing';

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

    // Save to new TypingHistory model (rich per-key errors)
    const record = new TypingHistory({
      studentId,
      mode: currentMode,
      lessonTitle: currentLesson,
      wpm,
      accuracy,
      duration: duration || 60,
      correctChars: correctChars || 0,
      incorrectChars: incorrectChars || 0,
      errors: errors || {},
      pointsAwarded: pointsAwarded
    });

    const saved = await record.save();

    // Also mirror to legacy TypingProgress for backward compatibility
    try {
      await new TypingProgress({
        studentId,
        wpm,
        accuracy,
        errorCount: incorrectChars || 0,
        mode: currentMode,
        lesson: currentLesson,
        time: duration || 60,
        pointsAwarded: pointsAwarded
      }).save();
    } catch (err) { /* non-critical */ }

    res.status(201).json({
      ...saved.toObject(),
      pointsAwarded,
      isFirstCompletion,
      accuracyThresholdMet: accuracy > 95
    });
  } catch (error) {
    console.error('saveTypingResult error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/typing/history/:studentId ────────────────────────────────────────
const getTypingHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const mode  = req.query.mode;  // optional filter

    const filter = { studentId };
    if (mode) filter.mode = mode;

    const history = await TypingHistory
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Compute summary stats
    const totalSessions = history.length;
    const avgWpm      = totalSessions ? Math.round(history.reduce((a, h) => a + h.wpm, 0)      / totalSessions) : 0;
    const avgAccuracy = totalSessions ? Math.round(history.reduce((a, h) => a + h.accuracy, 0) / totalSessions) : 0;
    const bestWpm     = totalSessions ? Math.max(...history.map(h => h.wpm)) : 0;

    res.json({
      sessions: history,
      summary: { totalSessions, avgWpm, avgAccuracy, bestWpm }
    });
  } catch (error) {
    console.error('getTypingHistory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/typing/last/:studentId ───────────────────────────────────────────
const getLastResult = async (req, res) => {
  try {
    const { studentId } = req.params;

    const last = await TypingHistory
      .findOne({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    if (!last) {
      return res.status(404).json({ message: 'No typing sessions found for this student' });
    }

    // Also fetch personal best
    const best = await TypingHistory
      .findOne({ studentId })
      .sort({ wpm: -1 })
      .lean();

    res.json({ last, best });
  } catch (error) {
    console.error('getLastResult error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/typing/lessons ───────────────────────────────────────────────────
const getLessons = async (req, res) => {
  try {
    const typingLessons = require('../data/typingLessons');
    const list = [];
    Object.entries(typingLessons).forEach(([category, lessons]) => {
      lessons.forEach((lesson, idx) => {
        list.push({ id: `${category}-${idx}`, category, ...lesson });
      });
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load lessons' });
  }
};

// ── GET /api/typing/lesson/:id ────────────────────────────────────────────────
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;  // format: "beginner-0"
    const [category, idx] = id.split('-');
    const typingLessons = require('../data/typingLessons');
    const lessons = typingLessons[category];
    if (!lessons || !lessons[parseInt(idx)]) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json({ id, category, ...lessons[parseInt(idx)] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveTypingResult,
  getTypingHistory,
  getLastResult,
  getLessons,
  getLessonById
};
