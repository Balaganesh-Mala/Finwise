const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load environment variables
dotenv.config();

const testInquiry = async () => {
    const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
    
    console.log('--- Testing Inquiry Email Trigger ---');
    
    // We need a real Course ID from the DB to test the email logic
    // But since this is a script, we can mock the request data that the frontend would send.
    // In our index.js, the route is /api/inquiries
    
    try {
        // Find a course first
        const db_uri = process.env.MONGO_URI;
        if (!db_uri) throw new Error('MONGO_URI not found in .env');
        
        await mongoose.connect(db_uri);
        const Course = require('./models/Course');
        const course = await Course.findOne();
        
        if (!course) {
            console.log('❌ No courses found in DB to test with.');
            process.exit(1);
        }

        console.log(`Using course: ${course.title} (ID: ${course._id})`);

        const payload = {
            name: 'Test User',
            email: process.env.MAIL_SENDER_EMAIL || 'test@example.com',
            phone: '1234567890',
            courseInterested: course.title,
            courseId: course._id,
            source: 'quote_popup', // This triggers the Fee & Curriculum email
            message: 'Testing the new email fixes and banner.'
        };

        console.log('Sending inquiry request...');
        const response = await axios.post(`${API_URL}/api/inquiries`, payload);
        
        console.log('Status Code:', response.status);
        console.log('Response:', response.data);
        console.log('\n✅ Script finished. Check your server console for the log: "✅ Inquiry response email sent to..."');
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Test failed:', err.response?.data || err.message);
        if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
    }
};

testInquiry();
