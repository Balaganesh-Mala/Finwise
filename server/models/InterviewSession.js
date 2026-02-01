const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  studentId: {
    type: String, // Storing Supabase UUID
    required: true,
    index: true
  },
  interviewType: {
    type: String,
    required: true,
    enum: [
      'HR',
      'Communication',
      'MS Office',
      'Web Development',
      'Basic Computers',
      'Data Entry',
      'Spoken English',
      'Custom'
    ]
  },
  mode: {
    type: String,
    enum: ['voice', 'text'],
    default: 'text'
  },
  questions: [{
    questionText: String,
    questionAudioUrl: String, // Optional URL if TTS is generated
    studentAnswer: String,
    aiEvaluation: {
      communicationScore: Number,
      confidenceScore: Number,
      technicalScore: Number,
      feedback: String,
      visualFeedback: String // "Great!", "Needs Improvement" etc
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  finalScore: {
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  overallFeedback: {
    strengths: [String],
    weaknesses: [String],
    improvementPlan: String
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
