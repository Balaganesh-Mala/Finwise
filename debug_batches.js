const axios = require('axios');

async function checkStudents() {
    try {
        const res = await axios.get('http://localhost:5000/api/students/list');
        console.log('Total students:', res.data.length);
        const studentsWithBatch = res.data.filter(s => s.batchName);
        console.log('Students with batch name:', studentsWithBatch.length);
        if (studentsWithBatch.length > 0) {
            console.log('Sample batch names:', studentsWithBatch.slice(0, 3).map(s => s.batchName));
        } else {
            console.log('No students have a batchName assigned in the API response.');
        }

        const batchesRes = await axios.get('http://localhost:5000/api/batches');
        console.log('Total batches in system:', batchesRes.data.batches.length);
        console.log('Batch names:', batchesRes.data.batches.map(b => b.name));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkStudents();
