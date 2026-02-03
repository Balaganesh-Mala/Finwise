const mongoose = require('mongoose');

const typingProgressSchema = new mongoose.Schema({
  studentId: {
    type: String, // Storing Supabase ID
    required: true,
    index: true
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  errorCount: {
    type: Number,
    default: 0
  },
  mode: {
    type: String,
    enum: ['time', 'words', 'quote', 'custom'],
    default: 'time'
  },
  lesson: {
    type: String,
    required: true
  },
  time: {
    type: Number, // Duration in seconds
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TypingProgress', typingProgressSchema);
