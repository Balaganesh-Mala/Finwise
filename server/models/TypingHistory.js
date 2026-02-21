const mongoose = require('mongoose');

const typingHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  mode: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  lessonTitle: {
    type: String,
    default: 'Free Typing'
  },
  wpm: {
    type: Number,
    required: true,
    min: 0
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,   // seconds
    default: 60
  },
  correctChars: {
    type: Number,
    default: 0
  },
  incorrectChars: {
    type: Number,
    default: 0
  },
  errors: {
    type: Map,
    of: Number,
    default: {}     // { "a": 3, "s": 5, "d": 2, ... }
  }
}, {
  timestamps: true
});

// Index for fast per-student queries
typingHistorySchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('TypingHistory', typingHistorySchema);
