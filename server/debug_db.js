const mongoose = require('mongoose');
const Application = require('./models/Application');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
require('dotenv').config();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Get the latest application
        const app = await Application.findOne().sort({ _id: -1 });
        if (!app) {
            console.log('Application not found');
        } else {
            console.log('Application found:', app._id);
            console.log('Original Resume URL:', app.resumeUrl);
            console.log('Public ID:', app.resumePublicId);

            if (app.resumePublicId) {
                const resourceType = app.resumeUrl.includes('/raw/') ? 'raw' : 'image';
                const signedUrl = cloudinary.utils.private_download_url(app.resumePublicId, 'pdf', {
                    resource_type: resourceType,
                    type: 'upload', 
                    attachment: false 
                });
                console.log('Generated Signed URL:', signedUrl);
                
                // Test fetch
                try {
                    const res = await axios.get(signedUrl);
                    console.log('Fetch Success Status:', res.status);
                    console.log('Content-Type:', res.headers['content-type']);
                } catch (e) {
                    console.log('Fetch Failed:', e.message);
                    if (e.response) console.log('Status:', e.response.status);
                }
            } else {
                console.log('No Public ID found');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

run();
