const axios = require('axios');

async function forceUpdate() {
    const url = 'http://localhost:5000/api/jobs';
    try {
        console.log("Searching for 'MS Office Trainer'...");
        const all = await axios.get(url);
        const target = all.data.find(j => j.title.trim() === "MS Office Trainer");
        
        if (target) {
            console.log(`Found: ${target.title} (${target._id}). Current Status: ${target.isStudentOnly}`);
            console.log("Force Updating to TRUE...");
            
            const res = await axios.put(`${url}/${target._id}`, { isStudentOnly: true });
            console.log("Update Result:", res.data.isStudentOnly);
        } else {
            console.error("Job not found!");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

forceUpdate();
