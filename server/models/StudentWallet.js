const mongoose = require('mongoose');

const StudentWalletSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalCoins: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: { type: String },
    icon: { type: String },
    dateEarned: { type: Date, default: Date.now }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentWallet', StudentWalletSchema);
