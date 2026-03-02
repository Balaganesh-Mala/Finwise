const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private/Admin
exports.addExpense = async (req, res) => {
  try {
    const { title, category, amount, date, note, bill_url } = req.body;
    
    if (!title || !category || !amount || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const expense = new Expense({
      title,
      category,
      amount,
      date,
      note,
      bill_url
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.deleteOne();
    res.status(200).json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};

// @desc    Get expense summary (monthly/category-wise)
// @route   GET /api/expenses/summary
// @access  Private/Admin
exports.getExpenseSummary = async (req, res) => {
  try {
    // A simple aggregation to get total expenses and category breakdown
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalExpenses = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.status(200).json({
      totalExpenses,
      categoryBreakdown: summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating expense summary', error: error.message });
  }
};
