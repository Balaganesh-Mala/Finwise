import os

filepath = 'd:/Projects/Finwise/server/controllers/financeController.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify markInstallmentPaid
old_mark = """    if (installment.status === 'Paid') {
      return res.status(400).json({ message: 'Installment is already marked as paid.' });
    }

    installment.status = 'Paid';
    installment.paid_date = new Date();
    installment.payment_mode = payment_mode;
    await installment.save();

    // 2. Create the payment history record
    const paymentRecord = new PaymentHistory({
      installment_id: installment._id,
      paid_amount: paid_amount || installment.amount,
      payment_mode,
      reference_id,
      receipt_url
    });"""

new_mark = """    if (installment.status === 'Paid') {
      return res.status(400).json({ message: 'Installment is already marked as paid.' });
    }

    // If paid_amount differs, we adjust the installment strictly to match what is paid.
    if (paid_amount && typeof paid_amount === 'number') {
        installment.amount = paid_amount;
    }

    installment.status = 'Paid';
    installment.paid_date = new Date();
    installment.payment_mode = payment_mode;
    await installment.save();

    // 2. Create the payment history record
    const paymentRecord = new PaymentHistory({
      installment_id: installment._id,
      paid_amount: installment.amount, // It's strictly synchronized now
      payment_mode,
      reference_id,
      receipt_url
    });"""

content = content.replace(old_mark, new_mark)

new_controllers = """// @desc    Edit a pending or overdue installment
// @route   PUT /api/finance/installments/:id
// @access  Private/Admin
exports.editInstallment = async (req, res) => {
  try {
    const { amount, due_date } = req.body;
    const installment = await Installment.findById(req.params.id);
    
    if (!installment) {
      return res.status(404).json({ message: 'Installment not found' });
    }
    
    if (installment.status === 'Paid') {
      return res.status(400).json({ message: 'Cannot modify an installment that is already paid.' });
    }

    if (amount) installment.amount = amount;
    if (due_date) installment.due_date = new Date(due_date);

    await installment.save();
    
    res.status(200).json({ message: 'Installment updated successfully', installment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating installment', error: error.message });
  }
};

// @desc    Create a custom individual installment for a fee structure
// @route   POST /api/finance/installments/standalone
// @access  Private/Admin
exports.createStandaloneInstallment = async (req, res) => {
  try {
    const { student_id, fee_structure_id, amount, due_date } = req.body;
    
    if (!student_id || !fee_structure_id || !amount || !due_date) {
      return res.status(400).json({ message: 'Missing required fields for installment creation.' });
    }

    // Verify FeeStructure exists
    const fs = await FeeStructure.findById(fee_structure_id);
    if (!fs) {
      return res.status(404).json({ message: 'Fee Structure not found' });
    }

    // Determine next installment number
    const maxInstallment = await Installment.findOne({ fee_structure_id }).sort('-installment_no');
    const nextNo = maxInstallment ? maxInstallment.installment_no + 1 : 1;

    const installment = new Installment({
      student_id,
      fee_structure_id,
      installment_no: nextNo,
      amount,
      due_date: new Date(due_date),
      status: 'Pending'
    });

    await installment.save();
    
    // Increment total installments counter
    fs.total_installments += 1;
    await fs.save();

    res.status(201).json({ message: 'Custom installment created successfully', installment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating custom installment', error: error.message });
  }
};
"""

content = content.replace("module.exports = exports;", "") # just in case
content += f"\n\n{new_controllers}"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Controllers updated.")
