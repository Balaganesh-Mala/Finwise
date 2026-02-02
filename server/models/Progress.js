const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  watchedDuration: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Ensure unique progress record per student per topic
ProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
