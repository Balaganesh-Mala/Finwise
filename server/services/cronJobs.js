const cron = require('node-cron');
const Installment = require('../models/Installment');
// const mongoose = require('mongoose');
// const { sendEmail } = require('./emailService'); // Assume you have some email service like nodemailer or SendGrid

const startCronJobs = () => {
  console.log('Finance cron jobs initialized...');

  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Running daily fee reminder check...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Check for installments due in exactly 3 days
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      const upcomingInstallments = await Installment.find({
        status: 'Pending',
        due_date: {
          $gte: threeDaysFromNow,
          $lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('student_id', 'name email');

      upcomingInstallments.forEach(inst => {
        // Mock email dispatch
        console.log(`[REMINDER] Sending 3-day reminder to ${inst.student_id.email} for Rs. ${inst.amount} due on ${inst.due_date}`);
        // sendEmail(inst.student_id.email, 'Upcoming Fee Reminder', `Your fee of ${inst.amount} is due on ${inst.due_date}`);
      });

      // 2. Check for installments due TODAY
      const dueTodayInstallments = await Installment.find({
        status: 'Pending',
        due_date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('student_id', 'name email');

      dueTodayInstallments.forEach(inst => {
         // Mock email dispatch
         console.log(`[DUE TODAY] Sending due today notice to ${inst.student_id.email}`);
      });

      // 3. Check for overdue installments (Due date was yesterday or before, and still pending)
      const overdueInstallments = await Installment.find({
         status: 'Pending',
         due_date: { $lt: today }
      }).populate('student_id', 'name email');

      // Update their status to Overdue
      if (overdueInstallments.length > 0) {
        const overdueIds = overdueInstallments.map(inst => inst._id);
        await Installment.updateMany(
            { _id: { $in: overdueIds } },
            { $set: { status: 'Overdue' } }
        );

        overdueInstallments.forEach(inst => {
          // Mock email dispatch
          console.log(`[OVERDUE] Sending overdue alert to ${inst.student_id.email}`);
        });
      }

    } catch (error) {
      console.error('Error in daily fee reminder cron job:', error);
    }
  });
};

module.exports = { startCronJobs };
