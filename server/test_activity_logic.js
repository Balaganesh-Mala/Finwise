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
        const range = 'week';

        const [progressDocs, typingDocs, attendanceDocs, txnDocs] = await Promise.all([
            Progress.find({ studentId, completed: true, updatedAt: { $gte: startDate } }).select('completedAt updatedAt pointsAwarded'),
            TypingHistory.find({ studentId, createdAt: { $gte: startDate } }).select('createdAt pointsAwarded'),
            Attendance.find({ studentId, date: { $gte: startDate } }).select('date'),
            Transaction.find({ studentId, date: { $gte: startDate } }).select('date type amount')
        ]);

        const bucketKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const map = {};
        bucketKeys.forEach(k => { map[k] = { points: 0, coins: 0 }; });

        const processGenericDoc = (doc, currentMap, dateField = 'date', pVal, cVal) => {
            const dateVal = doc.completedAt || doc.updatedAt || doc.createdAt || doc[dateField];
            if (!dateVal) {
                console.log('No dateVal for doc:', doc._id);
                return;
            }
            const d = new Date(dateVal);
            
            let key;
            if (range === 'week') {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                key = dayNames[d.getDay()];
            }
            
            if (currentMap[key]) {
                const p = (typeof pVal === 'function' ? pVal(doc) : (doc[pVal] || 0));
                const c = (typeof cVal === 'function' ? cVal(doc) : (doc[cVal] || 0));
                currentMap[key].points += p;
                currentMap[key].coins += c;
                console.log(`Added ${p} pts to ${key} from doc ${doc._id}`);
            } else {
                console.log('No bucket for key:', key);
            }
        };

        attendanceDocs.forEach(doc => processGenericDoc(doc, map, 'date', (d) => 50));
        txnDocs.forEach(doc => processGenericDoc(doc, map, 'date', 
            (d) => d.type === 'points' ? d.amount : 0,
            (d) => d.type === 'coins' ? d.amount : 0
        ));

        console.log('Final Map:', JSON.stringify(map, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
