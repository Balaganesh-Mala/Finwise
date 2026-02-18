const axios = require('axios');

async function fixAndVerify() {
    const url = 'http://localhost:5000/api/jobs';
    try {
        console.log("--- 1. Initialization (Migrate all to Public/False) ---");
        // Get all IDs
        const all = await axios.get(url);
        for (const job of all.data) {
            // Force update to ensure field exists
            if (job.isStudentOnly === undefined) {
                 console.log(`Migrating ${job._id} to explicit false...`);
                 await axios.put(`${url}/${job._id}`, { isStudentOnly: false });
            }
        }

        console.log("\n--- 2. Direct Test: Toggle 'React Developer' to Student Only ---");
        // Find 'React Developer' or just the first job
        const target = all.data.find(j => j.title.includes("React")) || all.data[0];
        if (target) {
            console.log(`Targeting: ${target.title} (${target._id})`);
            console.log("Sending PUT with isStudentOnly: true (boolean)...");
            
            const res = await axios.put(`${url}/${target._id}`, { isStudentOnly: true });
            console.log(`Server responded: isStudentOnly = ${res.data.isStudentOnly}`);
            
            if (res.data.isStudentOnly === true) {
                console.log("SUCCESS: Update persisted.");
            } else {
                console.error("FAILURE: Server returned false!");
            }
        } else {
            console.warn("No target job found.");
        }

        console.log("\n--- 3. Final State Check ---");
        const final = await axios.get(url);
        final.data.forEach(j => {
            console.log(`[${j._id}] ${j.title} => isStudentOnly: ${j.isStudentOnly}`);
        });

    } catch (e) {
        console.error("Error:", e.message);
        if(e.response) console.error(e.response.data);
    }
}

fixAndVerify();
