const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const MockInterviewSchedule = require('./server/models/MockInterviewSchedule');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const total = await MockInterviewSchedule.countDocuments();
        console.log('Total schedules:', total);

        const schedules = await MockInterviewSchedule.find().limit(5).populate('studentId', 'name').populate('interviewerId', 'name');
        console.log('Latest schedules:');
        console.log(JSON.stringify(schedules, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
