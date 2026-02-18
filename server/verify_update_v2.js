const axios = require('axios');
const FormData = require('form-data'); // You might need to install this or use built-in in recent Node
// Since we can't easily install new packages, we'll assume axios handles it or stick to JSON if form-data isn't available.
// Actually, in Node.js, we should construct headers manually if needed.

async function testUpdateRobust() {
    try {
        const url = 'http://localhost:5000/api/jobs';
        
        // 1. Create Public Job
        console.log("Creating Job...");
        const res = await axios.post(url, {
            title: "Robust Test " + Date.now(),
            company: "Test Corp",
            location: "Loc",
            type: "Full-time",
            description: "Desc",
            salary: "10k",
            isStudentOnly: false // Init False
        });
        const id = res.data._id;
        console.log(`Created [${id}]. State: ${res.data.isStudentOnly}`);

        // 2. Set to TRUE (Student Only) using JSON (just to verify code fix)
        console.log("\nUpdating to TRUE (JSON)...");
        await axios.put(`${url}/${id}`, { isStudentOnly: true });
        const check1 = await axios.get(`${url}/${id}`);
        console.log(`State: ${check1.data.isStudentOnly}`);

        // 3. Set to FALSE (Public) using JSON (verify fix)
        console.log("\nUpdating to FALSE (JSON)...");
        await axios.put(`${url}/${id}`, { isStudentOnly: 'false' }); // sending string in JSON to mimic mix
        const check2 = await axios.get(`${url}/${id}`);
        console.log(`State: ${check2.data.isStudentOnly}`);

         // cleanup
         await axios.delete(`${url}/${id}`);

    } catch (e) {
        console.error("FAIL:", e.message);
    }
}

testUpdateRobust();
