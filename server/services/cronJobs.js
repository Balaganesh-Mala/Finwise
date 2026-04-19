const cron = require('node-cron');
const Installment = require('../models/Installment');
const Setting = require('../models/Setting');
const { sendEmail } = require('../utils/emailService');
const { generateFeeReminderTemplate } = require('../utils/emailTemplates');

const { checkAndSendInterviewReminders } = require('./interviewReminderService');

const startCronJobs = () => {

  // 1. Interview Reminders - Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await checkAndSendInterviewReminders();
  });

  // 2. Finance Reminders - Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Running daily fee reminder check...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const settings = await Setting.findOne() || {};

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

      for (const inst of upcomingInstallments) {
        if (inst.student_id?.email) {
          const emailHtml = generateFeeReminderTemplate(
            inst.student_id.name,
            inst.amount,
            inst.due_date,
            inst.installment_no,
            settings
          );
          const subject = `Fee Reminder: Installment #${inst.installment_no} is due in 3 days`;
          try {
            await sendEmail(inst.student_id.email, subject, emailHtml);
            console.log(`[REMINDER] Sent 3-day reminder to ${inst.student_id.email} for Rs. ${inst.amount}`);
          } catch (mailError) {
            console.error(`Failed to send reminder to ${inst.student_id.email}:`, mailError.message);
          }
        }
      }

      // 2. Check for installments due TODAY
      const dueTodayInstallments = await Installment.find({
        status: 'Pending',
        due_date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('student_id', 'name email');

      for (const inst of dueTodayInstallments) {
         if (inst.student_id?.email) {
           // We can also send emails here if desired, but 3-day was specifically requested.
           console.log(`[DUE TODAY] Logging due today notice for ${inst.student_id.email}`);
         }
      }

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
          console.log(`[OVERDUE] Status updated to Overdue for ${inst.student_id?.email || 'Unknown'}`);
        });
      }

    } catch (error) {
      console.error('Error in daily fee reminder cron job:', error);
    }
  });
};

module.exports = { startCronJobs };
