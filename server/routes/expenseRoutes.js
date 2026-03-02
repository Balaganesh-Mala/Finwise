const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  deleteExpense, 
  getExpenseSummary 
} = require('../controllers/expenseController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Uncomment and use as per your setup

// Prefix: /api/expenses
router.route('/')
  .get(getExpenses)
  .post(addExpense);

router.route('/summary')
  .get(getExpenseSummary);

router.route('/:id')
  .delete(deleteExpense);

module.exports = router;
