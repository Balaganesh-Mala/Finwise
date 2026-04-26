const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Transaction = require('./models/Transaction');
const Progress = require('./models/Progress');
const TypingHistory = require('./models/TypingHistory');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        const startDate = new Date('2026-04-20T00:00:00Z');

        const attendanceDocs = await Attendance.find({ studentId, date: { $gte: startDate } }).select('date');
        console.log('Attendance Count:', attendanceDocs.length);
        if (attendanceDocs.length > 0) console.log('First Attendance Date:', attendanceDocs[0].date);

        const txnDocs = await Transaction.find({ studentId, date: { $gte: startDate } }).select('date type amount');
        console.log('Transactions Count:', txnDocs.length);

        const progressDocs = await Progress.find({ studentId, completed: true, updatedAt: { $gte: startDate } }).select('completedAt updatedAt pointsAwarded');
        console.log('Progress Count:', progressDocs.length);

        const typingDocs = await TypingHistory.find({ studentId, createdAt: { $gte: startDate } }).select('createdAt pointsAwarded');
        console.log('Typing Count:', typingDocs.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
