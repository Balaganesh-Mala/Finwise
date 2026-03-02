const FeeStructure = require('../models/FeeStructure');
const Installment = require('../models/Installment');
const PaymentHistory = require('../models/PaymentHistory');
const Expense = require('../models/Expense');
const Student = require('../models/Student');
const { sendEmail } = require('../utils/emailService');
const { generateFeeReminderTemplate } = require('../utils/emailTemplates');

// @desc    Get dashboard metrics (total fees, pending, expenses, chart data)
// @route   GET /api/finance/dashboard
// @access  Private/Admin
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { filter } = req.query; // 'all', 'month', 'year'
    const today = new Date();
    
    // Determine start date for stats based on filter
    let startDate = new Date(0); // 'all' time
    if (filter === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (filter === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    // 1. Fee Metrics
    const allInstallments = await Installment.find();
    let totalFeesCollected = 0;
    let pendingFees = 0;
    let pendingCount = 0;
    let overdueFees = 0;
    
    allInstallments.forEach(inst => {
      const instDate = new Date(inst.due_date);
      
      // Pending count/fees are usually current snapshot, not strictly date-bound
      // But we'll bound Payments to the selected date range
      if (inst.status === 'Paid') {
          // Check if paid_date falls in filter range
          const paidDate = inst.paid_date ? new Date(inst.paid_date) : instDate;
          if (paidDate >= startDate) {
            totalFeesCollected += inst.amount;
          }
      } else if (inst.status === 'Overdue') {
        overdueFees += inst.amount;
        pendingCount++;
      } else if (inst.status === 'Pending') {
        pendingFees += inst.amount;
        pendingCount++;
      }
    });

    // 2. Expense Metrics
    const allExpenses = await Expense.find();
    let totalExpenses = 0;
    
    // Monthly breakdown for charts
    const monthlyDataMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyDataMap[monthKey] = { name: monthKey, income: 0, expense: 0, sortValue: d.getTime() };
    }

    // Process Payments for Income Chart
    const payments = await PaymentHistory.find();
    payments.forEach(pay => {
      const d = new Date(pay.createdAt || pay.paid_date || new Date()); // fallback
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey].income += pay.paid_amount;
      }
    });
    
    // Process Expenses for Expense Chart & Category Breakdown
    const categoryDataMap = {};
    
    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      
      // Only add to summary total if within filter range
      if (d >= startDate) {
        totalExpenses += exp.amount;
        
        // Only add to category breakdown if within filter range
        if (!categoryDataMap[exp.category]) {
          categoryDataMap[exp.category] = 0;
        }
        categoryDataMap[exp.category] += exp.amount;
      }
      
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey].expense += exp.amount;
      }
    });

    // Format Data for Charts
    const incomeVsExpenseData = Object.values(monthlyDataMap).sort((a,b) => a.sortValue - b.sortValue).map(curr => ({
      name: curr.name.split(' ')[0], // Just Month name
      income: curr.income,
      expense: curr.expense
    }));
    
    const expenseCategoryData = Object.keys(categoryDataMap).map(key => ({
      name: key,
      value: categoryDataMap[key]
    }));

    // Compile summary
    const netProfit = totalFeesCollected - totalExpenses;

    res.status(200).json({
      summaryStats: {
        totalFeesCollected,
        pendingFees: pendingFees + overdueFees,
        pendingCount,
        totalExpenses,
        netProfit,
        overdueFees
      },
      charts: {
        incomeVsExpenseData,
        expenseCategoryData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard metrics', error: error.message });
  }
};

// @desc    Add a fee structure for a student and generate installments
// @route   POST /api/finance/fee-structure
// @access  Private/Admin
exports.createFeeStructure = async (req, res) => {
  try {
    const { student_id, total_fee, installments_data } = req.body;
    // installments_data is expected to be an array of objects: [{ amount, due_date }]
    
    if (!student_id || !total_fee || !installments_data || installments_data.length === 0) {
      return res.status(400).json({ message: 'Invalid fee structure data provided.' });
    }

    const total_installments = installments_data.length;

    // Create the main Fee Structure record
    const feeStructure = new FeeStructure({
      student_id,
      total_fee,
      total_installments
    });
    await feeStructure.save();

    // Create individual Installment records
    const installmentDocs = installments_data.map((inst, index) => ({
      student_id,
      fee_structure_id: feeStructure._id,
      installment_no: index + 1,
      amount: inst.amount,
      due_date: new Date(inst.due_date),
      status: 'Pending'
    }));

    await Installment.insertMany(installmentDocs);

    res.status(201).json({ message: 'Fee structure and installments created successfully!', feeStructure });
  } catch (error) {
    res.status(500).json({ message: 'Error creating fee structure', error: error.message });
  }
};

// @desc    Get all installments (with optional filters like status, student)
// @route   GET /api/finance/installments
// @access  Private/Admin
exports.getInstallments = async (req, res) => {
  try {
    const { status, student_id } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (student_id) query.student_id = student_id;

    const installments = await Installment.find(query)
      .populate('student_id', 'name email phone batch timing')
      .sort({ due_date: 1 });
      
    res.status(200).json(installments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching installments', error: error.message });
  }
};

// @desc    Mark an installment as paid & record history
// @route   POST /api/finance/installments/:id/pay
// @access  Private/Admin
exports.markInstallmentPaid = async (req, res) => {
  try {
    const { paid_amount, payment_mode, reference_id, receipt_url } = req.body;
    const installmentId = req.params.id;

    // 1. Find and update the installment
    const installment = await Installment.findById(installmentId).populate('student_id', 'name email');
    if (!installment) {
      return res.status(404).json({ message: 'Installment not found' });
    }
    
    if (installment.status === 'Paid') {
      return res.status(400).json({ message: 'Installment is already marked as paid.' });
    }

    installment.status = 'Paid';
    installment.paid_date = new Date();
    await installment.save();

    // 2. Create the payment history record
    const paymentRecord = new PaymentHistory({
      installment_id: installment._id,
      paid_amount: paid_amount || installment.amount,
      payment_mode,
      reference_id,
      receipt_url
    });
    await paymentRecord.save();

    // TODO: Trigger PDF/Email receipt generation here

    res.status(200).json({ message: 'Payment recorded successfully', payment: paymentRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
};

// @desc    Send manual reminder for a specific installment
// @route   POST /api/finance/installments/:id/remind
// @access  Private/Admin
exports.sendManualReminder = async (req, res) => {
  try {
    const installment = await Installment.findById(req.params.id).populate('student_id', 'name email');
    if (!installment) return res.status(404).json({ message: 'Installment not found' });
    if (installment.status === 'Paid') return res.status(400).json({ message: 'Installment is already paid.' });

    if (!installment.student_id.email) {
      return res.status(400).json({ message: 'Student does not have an email address on file.' });
    }

    // Send email using our email service and template
    const emailHtml = generateFeeReminderTemplate(
      installment.student_id.name,
      installment.amount,
      installment.due_date,
      installment.installment_no
    );

    const subject = `Fee Reminder: Installment #${installment.installment_no} is due soon`;
    
    await sendEmail(installment.student_id.email, subject, emailHtml);

    res.status(200).json({ message: `Reminder email sent to ${installment.student_id.email}` });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reminder', error: error.message });
  }
};
