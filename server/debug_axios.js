const axios = require('axios');
const fs = require('fs');

const url = "https://res.cloudinary.com/drzs556ss/image/upload/v1770048045/job_applications/1770048043983-MS_OFFICE_lesson_plan_ejcpt7.pdf"; 
// I am using the URL from a previous curl command in the history since the DB output was truncated, 
// but wait, I should probably use the one from the recent failure if possible. 
// Let's us a known 'raw' URL from the user's history or just a generic one if available.
// Actually, I'll use the one from the curl command that I ran earlier:
// https://res.cloudinary.com/drzs556ss/raw/upload/v1770046619/job_applications/1770046618575-MS_OFFICE_lesson_plan_lrrlyd.pdf
// This was the one failing to load in previous turns.

const run = async () => {
    try {
        console.log("Fetching URL:", url);
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        console.log("Response status:", response.status);
        console.log("Headers:", response.headers);

        const writer = fs.createWriteStream('test_download.pdf');
        response.data.pipe(writer);

        writer.on('finish', () => console.log('Download finished'));
        writer.on('error', (err) => console.error('Writer error:', err));
    } catch (err) {
        console.error("Axios error:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
        }
    }
};

run();
