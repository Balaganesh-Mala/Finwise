const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Assuming your student model is named 'Student'
    required: true,
  },
  total_fee: {
    type: Number,
    required: true,
  },
  total_installments: {
    type: Number,
    required: true,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
