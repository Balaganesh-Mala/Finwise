require('dotenv').config();
const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const Topic = require('./models/Topic');
const Student = require('./models/Student');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const today = new Date();
    const diffToMon = (today.getDay() + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMon);
    startOfWeek.setHours(0, 0, 0, 0);

    const leaderboard = await Progress.aggregate([
        {
            $match: {
                completed: true,
                updatedAt: { $gte: startOfWeek }
            }
        },
        {
            $lookup: {
                from: 'topics',
                localField: 'topicId',
                foreignField: '_id',
                as: 'topic'
            }
        },
        { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$studentId',
                totalMinutes: {
                    $sum: {
                        $cond: [
                            { $gt: ['$topic.duration', 0] },
                            '$topic.duration',
                            { $divide: [{ $ifNull: ['$watchedDuration', 0] }, 60] }
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'studentInfo'
            }
        },
        { $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: 1,
                name: '$studentInfo.name',
                email: '$studentInfo.email',
                profilePicture: '$studentInfo.profilePicture',
                totalHours: { $divide: ['$totalMinutes', 60] }
            }
        },
        { $sort: { totalHours: -1 } },
        { $limit: 10 }
    ]);

    console.log('Leaderboard Result:', JSON.stringify(leaderboard, null, 2));
    await mongoose.disconnect();
}

check().catch(console.error);
