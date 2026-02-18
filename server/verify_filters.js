const axios = require('axios');

async function testFilters() {
    const url = 'http://localhost:5000/api/jobs';

    try {
        console.log("1. FETCH ALL:");
        const all = await axios.get(url);
        console.log(`   Count: ${all.data.length}`);
        if(all.data.length > 0) {
            console.log(`   Sample ID: ${all.data[0]._id}, isStudentOnly: ${all.data[0].isStudentOnly}`);
        }

        console.log("\n2. FETCH STUDENT (?type=student):");
        const student = await axios.get(`${url}?type=student`);
        console.log(`   Count: ${student.data.length}`);
        student.data.forEach(j => console.log(`   - ${j.title} (${j._id})`));

        console.log("\n3. FETCH CLIENT (?type=client):");
        const client = await axios.get(`${url}?type=client`);
        console.log(`   Count: ${client.data.length}`);
        client.data.forEach(j => console.log(`   - ${j.title} (${j._id})`));

    } catch (e) {
        console.error("FAIL:", e.message);
    }
}

testFilters();
