const axios = require('axios');

async function test() {
    try {
        const studentRes = await axios.get('http://localhost:5000/api/students/list');
        const students = studentRes.data;
        
        // Let's get batches info too
        const batchRes = await axios.get('http://localhost:5000/api/batches');
        if (batchRes.data.batches.length > 0) {
            const batchId = batchRes.data.batches[0]._id;
            const batchStudentsRes = await axios.get(`http://localhost:5000/api/batches/${batchId}/students`);
            const batchStudents = batchStudentsRes.data.students;
            
            console.log("\n--- Batch Students ---");
            batchStudents.forEach(bs => {
                console.log(`Student: ${bs.studentId.name}, Has FeeSummary: ${!!bs.feeSummary}`);
                if (bs.feeSummary) console.log("   Fee:", bs.feeSummary.totalFee);
            });
        }

        console.log("\n--- Students List ---");
        students.forEach(s => {
            console.log(`Student: ${s.name}, Has FeeDetails: ${!!s.feeDetails}`);
            if (s.feeDetails) console.log("   Fee:", s.feeDetails.totalFee);
        });
        
    } catch (e) {
        console.error(e.message);
    }
}
test();
