const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: ['points', 'coins'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true // e.g., 'mock_interview', 'bonus', 'first_interview'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterviewFeedback'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
