const axios = require('axios');

async function test() {
    try {
        console.log("--- Testing Public Jobs (Client) ---");
        const publicRes = await axios.get('http://localhost:5000/api/jobs?client=true');
        console.log(`Status: ${publicRes.status}`);
        console.log(`Count: ${publicRes.data.length}`);
        publicRes.data.forEach(j => console.log(`- ${j.title} (StudentOnly: ${j.isStudentOnly})`));

        console.log("\n--- Testing All Jobs (Student/Admin) ---");
        const allRes = await axios.get('http://localhost:5000/api/jobs');
        console.log(`Status: ${allRes.status}`);
        console.log(`Count: ${allRes.data.length}`);
        allRes.data.forEach(j => console.log(`- ${j.title} (StudentOnly: ${j.isStudentOnly})`));

    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
}

test();
