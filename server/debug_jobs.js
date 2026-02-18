const axios = require('axios');

async function checkJobs() {
    try {
        const url = 'http://localhost:5000/api/jobs';
        
        console.log("--- Fetching ALL jobs (no filter) ---\n");
        // We need a route that fetches all without logic, but our route applies logic based on query.
        // If we send NO query, it should return ALL.
        const res = await axios.get(url);
        
        console.log(`Total Jobs: ${res.data.length}\n`);
        
        res.data.forEach(job => {
            console.log(`[${job._id}] "${job.title}" | isStudentOnly: ${job.isStudentOnly} | Company: ${job.company}`);
        });

        console.log("\n--- Fetching STUDENT jobs (?type=student) ---");
        const studentRes = await axios.get(`${url}?type=student`);
        console.log(`Count: ${studentRes.data.length}`);
        studentRes.data.forEach(j => console.log(`  > ${j.title}`));

        console.log("\n--- Fetching CLIENT jobs (?type=client) ---");
        const clientRes = await axios.get(`${url}?type=client`);
        console.log(`Count: ${clientRes.data.length}`);
        clientRes.data.forEach(j => console.log(`  > ${j.title}`));

    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkJobs();
