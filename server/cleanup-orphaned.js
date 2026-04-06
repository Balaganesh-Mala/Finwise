const mongoose = require('mongoose');
const BatchStudent = require('./models/BatchStudent');
const Student = require('./models/Student');
const FeeStructure = require('./models/FeeStructure');
const Installment = require('./models/Installment');
const Progress = require('./models/Progress');

async function cleanup() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        console.log('✅ Connected.');

        const enrollments = await BatchStudent.find();
        console.log(`Analyzing ${enrollments.length} enrollment records...`);
        
        let removedCount = 0;
        for (const en of enrollments) {
            const studentExists = await Student.findById(en.studentId);
            if (!studentExists) {
                await BatchStudent.deleteOne({ _id: en._id });
                removedCount++;
            }
        }
        
        console.log(`✅ Successfully removed ${removedCount} orphaned batch enrollment records.`);

        // Also cleanup FeeStructures for missing students
        const feeStructures = await FeeStructure.find();
        let removedFS = 0;
        for (const fs of feeStructures) {
            const studentExists = await Student.findById(fs.student_id);
            if (!studentExists) {
                // Delete FeeStructure and its installments
                await Installment.deleteMany({ fee_structure_id: fs._id });
                await FeeStructure.deleteOne({ _id: fs._id });
                removedFS++;
            }
        }
        console.log(`✅ Successfully removed ${removedFS} orphaned fee records.`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
