const axios = require('axios');

async function testUpdate() {
    try {
        const url = 'http://localhost:5000/api/jobs';
        
        // 1. Create a Temp Job
        console.log("Creating Temp Job...");
        const createRes = await axios.post(url, {
            title: "Temp Job " + Date.now(),
            company: "Test Corp",
            location: "Test Loc",
            type: "Full-time",
            description: "Desc",
            salary: "10k",
            isStudentOnly: false, // Start as Public
            skills: [], responsibilities: [], requirements: []
        });
        const id = createRes.data._id;
        console.log(`Created Job [${id}]. isStudentOnly: ${createRes.data.isStudentOnly}`);

        // 2. Update to Student Only (Boolean)
        console.log("\nUpdating to Student Only (Boolean true)...");
        const updateRes1 = await axios.put(`${url}/${id}`, {
            isStudentOnly: true
        });
        console.log(`Result: isStudentOnly = ${updateRes1.data.isStudentOnly}`);

        // 3. Update to Public (String "false") - Simulating FormData
        console.log("\nUpdating to Public (String 'false')...");
        const updateRes2 = await axios.put(`${url}/${id}`, {
            isStudentOnly: 'false'
        });
        console.log(`Result: isStudentOnly = ${updateRes2.data.isStudentOnly}`);

         // 4. Update to Student Only (String "true") - Simulating FormData
        console.log("\nUpdating to Student Only (String 'true')...");
        const updateRes3 = await axios.put(`${url}/${id}`, {
            isStudentOnly: 'true'
        });
        console.log(`Result: isStudentOnly = ${updateRes3.data.isStudentOnly}`);

        // Clean up
        await axios.delete(`${url}/${id}`);
        console.log("\nCleaned up.");

    } catch (e) {
        console.error("FAIL:", e.message);
        if (e.response) console.error(e.response.data);
    }
}

testUpdate();
