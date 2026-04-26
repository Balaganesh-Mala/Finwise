const mongoose = require('mongoose');
const TypingHistory = require('./models/TypingHistory');
const MockInterviewFeedback = require('./models/MockInterviewFeedback');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const typingDocs = await TypingHistory.find({ studentId, createdAt: { $gte: startOfToday } });
        console.log('Typing Count Today:', typingDocs.length);
        if (typingDocs.length > 0) {
            const total = typingDocs.reduce((acc, d) => acc + (d.pointsAwarded || 0), 0);
            console.log('Total Typing Points:', total);
        }

        const mockDocs = await MockInterviewFeedback.find({ 
            studentId, 
            isSubmitted: true,
            $or: [
                { interviewDate: { $gte: startOfToday } },
                { createdAt: { $gte: startOfToday } }
            ]
        });
        console.log('Mock Interview Count Today:', mockDocs.length);
        if (mockDocs.length > 0) {
            const total = mockDocs.reduce((acc, d) => acc + (d.pointsEarned || 0) + (d.bonusPoints || 0) + (d.firstInterviewBonus || 0), 0);
            console.log('Total Mock Points:', total);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
