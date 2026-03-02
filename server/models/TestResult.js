const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Assuming 'Student' is the model name for students
    required: true,
  },
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    // Add ref if you have a Test model, otherwise just ObjectId or String representation
    required: false, 
  },
  score: {
    type: Number,
    required: true,
  },
  total_score: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number, // Percentage 0-100
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  weak_topics: [{
    type: String
  }],
  strong_topics: [{
    type: String
  }],
  time_taken: {
    type: Number, // in seconds
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
