const axios = require('axios');

async function run() {
    try {
        const res = await axios.get('http://localhost:5000/api/courses');
        console.log('--- API Response Data ---');
        res.data.forEach(c => {
            console.log(`Title: ${c.title} | isBonus: ${c.isBonus} (${typeof c.isBonus})`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error fetching courses:', err.message);
        process.exit(1);
    }
}

run();
