const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Rent', 'Electricity', 'Wifi', 'Salaries', 'Marketing', 'Miscellaneous'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    trim: true,
  },
  bill_url: {
    type: String,
    trim: true, // URL to uploaded PDF/JPG
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
