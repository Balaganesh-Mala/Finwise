const axios = require('axios');

const testFetch = async () => {
    try {
        console.log('Fetching courses from http://localhost:5000/api/courses ...');
        const res = await axios.get('http://localhost:5000/api/courses');
        console.log('Status:', res.status);
        console.log('Data Length:', res.data.length);
        console.log('First Course:', res.data[0]?.title);
    } catch (err) {
        console.error('Fetch Error:', err.message);
        if (err.response) {
             console.error('Response Status:', err.response.status);
             console.error('Response Data:', err.response.data);
        }
    }
};

testFetch();
