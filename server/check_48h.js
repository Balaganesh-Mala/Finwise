const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const TypingHistory = require('./models/TypingHistory');
const Attendance = require('./models/Attendance');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        console.log('Searching from:', fortyEightHoursAgo.toISOString());

        const progressDocs = await Progress.find({ studentId, completed: true, updatedAt: { $gte: fortyEightHoursAgo } });
        console.log('Progress (48h):', progressDocs.map(d => ({ id: d._id, date: d.updatedAt || d.completedAt })));

        const attendanceDocs = await Attendance.find({ studentId, date: { $gte: fortyEightHoursAgo } });
        console.log('Attendance (48h):', attendanceDocs.map(d => ({ id: d._id, date: d.date })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
