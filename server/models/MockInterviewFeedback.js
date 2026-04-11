const mongoose = require('mongoose');

const MockInterviewFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  interviewerName: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    required: true
  },
  interviewDate: {
    type: Date,
    default: Date.now
  },
  
  // Ratings (out of 10)
  overallScore: { type: Number, required: true },
  communicationScore: { type: Number, required: true },
  technicalScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  problemSolvingScore: { type: Number, required: true },
  bodyLanguageScore: { type: Number, required: true },
  practicalScore: { type: Number, required: true },

  // Gamification Data
  status: {
    type: String,
    enum: ['Job Ready', 'Highly Capable', 'Capable', 'Needs Improvement', 'Critical Risk'],
    default: 'Needs Improvement'
  },
  weakAreas: [{ type: String }],
  isSubmitted: { type: Boolean, default: true },

  // Topic-wise Performance
  topicScores: [{
    topic: { type: String, required: true },
    score: { type: Number, required: true }
  }],

  // Text Feedback
  strengths: { type: String },
  weaknesses: { type: String },
  suggestions: { type: String },

  // Improvement Plan
  improvementPlan: [{
    task: { type: String },
    completed: { type: Boolean, default: false }
  }],

  // Recording
  recordingUrl: { type: String },

  // Gamification Data
  pointsEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  bonusPoints: { type: Number, default: 0 },
  bonusCoins: { type: Number, default: 0 },
  firstInterviewBonus: { type: Number, default: 0 },
  firstInterviewCoinsBonus: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MockInterviewFeedback', MockInterviewFeedbackSchema);
