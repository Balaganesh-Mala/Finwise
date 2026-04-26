const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const Attendance = require('./models/Attendance');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const progressDocs = await Progress.find({ studentId, completed: true, updatedAt: { $gte: startOfToday } });
        console.log('Progress Count Today:', progressDocs.length);
        if (progressDocs.length > 0) console.log('Progress Docs:', JSON.stringify(progressDocs, null, 2));

        const attendanceDocs = await Attendance.find({ studentId, date: { $gte: startOfToday } });
        console.log('Attendance Count Today:', attendanceDocs.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
