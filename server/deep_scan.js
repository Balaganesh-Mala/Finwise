const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        const studentId = '69d391848611a33c5f8e644c';
        const oneHourAgo = new Date(Date.now() - 3600 * 1000);

        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            const name = col.name;
            const docs = await mongoose.connection.db.collection(name).find({
                $or: [
                    { studentId: new mongoose.Types.ObjectId(studentId) },
                    { studentId: studentId },
                    { _id: new mongoose.Types.ObjectId(studentId) }
                ],
                $or: [
                    { createdAt: { $gte: oneHourAgo } },
                    { updatedAt: { $gte: oneHourAgo } },
                    { date: { $gte: oneHourAgo } }
                ]
            }).toArray();
            
            if (docs.length > 0) {
                console.log(`Collection [${name}] has ${docs.length} recent docs:`, JSON.stringify(docs, null, 2));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
