const axios = require('axios');
const mongoose = require('mongoose');

// DB Connection (Hardcoded for test)
const MONGO_URI = 'mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center';

// API Endpoints
const BASE_URL = 'http://localhost:5000/api';
const TRAINER_LOGIN = `${BASE_URL}/trainer/auth/login`;
const ADMIN_STATUS_UPDATE = `${BASE_URL}/admin/trainers/status`;
const TRAINER_PROTECTED = `${BASE_URL}/trainer/auth/me`;

async function runTest() {
    let trainerId = null;
    let token = null;

    try {
        console.log("--- Connecting to DB ---");
        await mongoose.connect(MONGO_URI);
        const Trainer = require('./server/models/Trainer');

        // 1. Create Dummy Trainer
        console.log("--- Creating Dummy Trainer ---");
        const email = `test_activation_${Date.now()}@test.com`;
        const trainer = await Trainer.create({
            name: 'Activation Test',
            email: email,
            password: 'password123', // Will be hashed by pre-save
            role: 'Other',
            status: 'active'
        });
        trainerId = trainer._id.toString();
        console.log(`Created Trainer ID: ${trainerId}`);

        // 2. Login as Trainer
        console.log("--- Logging in as Trainer ---");
        const loginRes = await axios.post(TRAINER_LOGIN, {
            email: email,
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log("Login Successful. Token received.");

        // 3. Access Protected Route (Before Deactivation)
        console.log("--- Accessing Protected Route (Active) ---");
        await axios.get(TRAINER_PROTECTED, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success: Active trainer can access protected route.");

        // 4. Deactivate Trainer (Admin Action simulation)
        console.log("--- Deactivating Trainer ---");
        // Using axios to simulate admin API call would need admin auth/middleware bypass, 
        // to simplify we update DB directly or use the route if we disable admin middleware for a sec.
        // Let's update DB directly to simulate the admin's effect on the user state.
        await Trainer.findByIdAndUpdate(trainerId, { status: 'rejected' });
        console.log("Trainer Status set to 'rejected'.");

        // 5. Access Protected Route (After Deactivation)
        console.log("--- Accessing Protected Route (Deactivated) ---");
        try {
            await axios.get(TRAINER_PROTECTED, {
                headers: { Authorization: `Bearer ${token}` }
            });
            throw new Error("FAILURE: Deactivated trainer SHOULD NOT access protected route!");
        } catch (err) {
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                console.log(`Success: Access blocked with status ${err.response.status}.`);
            } else {
                throw err; // Real error or unexpected status
            }
        }

        // 6. Reactivate Trainer
        console.log("--- Reactivating Trainer ---");
        await Trainer.findByIdAndUpdate(trainerId, { status: 'active' });
        console.log("Trainer Status set to 'active'.");

        // 7. Access Protected Route (After Reactivation)
        console.log("--- Accessing Protected Route (Reactivated) ---");
        await axios.get(TRAINER_PROTECTED, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success: Reactivated trainer can access protected route.");

        // Cleanup
        await Trainer.findByIdAndDelete(trainerId);
        console.log("--- Cleanup Complete ---");

    } catch (err) {
        console.error("TEST FAILED:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
