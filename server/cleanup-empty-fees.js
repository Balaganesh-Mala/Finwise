const mongoose = require('mongoose');
const FeeStructure = require('./models/FeeStructure');
const Installment = require('./models/Installment');

async function cleanup() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        console.log('✅ Connected.');

        const feeStructures = await FeeStructure.find();
        console.log(`Analyzing ${feeStructures.length} fee structures...`);
        
        let removedCount = 0;
        for (const fs of feeStructures) {
            const installmentCount = await Installment.countDocuments({ fee_structure_id: fs._id });
            if (installmentCount === 0) {
                await FeeStructure.deleteOne({ _id: fs._id });
                removedCount++;
            }
        }
        
        console.log(`✅ Successfully removed ${removedCount} empty fee structures. You can now re-add these students.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
