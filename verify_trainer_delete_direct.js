const mongoose = require('mongoose');
const axios = require('axios');
const Trainer = require('./server/models/Trainer');

// Hardcoded for this test script based on .env
const MONGO_URI = 'mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center';

async function runTest() {
    try {
        // 1. Connect to DB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 2. Create Dummy Trainer directly in DB
        const dummyTrainer = new Trainer({
            name: 'Delete Me Direct',
            email: `deleteme_${Date.now()}@test.com`,
            password: 'password123',
            role: 'Other',
            status: 'applicant'
        });
        
        await dummyTrainer.save();
        console.log(`Dummy trainer created directly in DB. ID: ${dummyTrainer._id}`);

        // 3. Delete via API
        const deleteUrl = `http://localhost:5000/api/admin/trainers/${dummyTrainer._id}`;
        console.log(`Attempting DELETE request to: ${deleteUrl}`);
        
        await axios.delete(deleteUrl);
        console.log('DELETE request successful (200 OK).');

        // 4. Verify removal from DB
        const check = await Trainer.findById(dummyTrainer._id);
        if (check) {
            console.error('FAILURE: Trainer still exists in DB!');
        } else {
            console.log('SUCCESS: Trainer removed from DB.');
        }

    } catch (err) {
        console.error('TEST FAILED:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
