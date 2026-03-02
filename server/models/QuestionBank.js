const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Accounting',
      'Taxation',
      'Financial Management',
      'Auditing',
      'Economics for Finance',
      'Business Law',
      'CA Foundation',
      'CA Intermediate',
      'CA Final'
    ],
    required: true,
  },
  type: {
    type: String,
    enum: ['MCQ', 'Practical Problem', 'Case Study'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Basic', 'Moderate', 'Advanced'],
    default: 'Moderate'
  },
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  correctAnswer: {
    type: String, // E.g., 'A', 'B', 'C', 'D' or a descriptive answer for Practical Problems
    required: true,
  },
  explanation: {
    type: String,
  },
  formula: {
    type: String,
  },
  attachmentUrl: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
