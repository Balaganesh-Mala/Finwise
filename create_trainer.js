const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api/admin/trainers/create';
const ADMIN_SECRET = 'placeholder_if_you_had_admin_auth'; // Currently API is open or uses placeholder token middleware check if any

// Trainer Details to Create
const newTrainer = {
    name: "John Doe",
    email: "trainer@example.com",
    role: "MS Office Trainer" // Options: 'MS Office Trainer', 'Spoken English Trainer', 'Coding Trainer'
};

async function createTrainer() {
    console.log("Creating trainer...");
    try {
        const response = await axios.post(API_URL, newTrainer);
        console.log("\nSuccess! Trainer Created:");
        console.log("--------------------------");
        console.log(`Name:     ${response.data.name}`);
        console.log(`Email:    ${response.data.email}`);
        console.log(`Password: ${response.data.password}`); // The API generates and returns a password
        console.log("--------------------------");
        console.log("Please copy these credentials to login at http://localhost:5176/login");
    } catch (error) {
        console.error("Error creating trainer:", error.response ? error.response.data : error.message);
    }
}

createTrainer();
