const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const txnDocs = await Transaction.find({ studentId, date: { $gte: startOfToday } });
        console.log('Transactions Today:', JSON.stringify(txnDocs, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
