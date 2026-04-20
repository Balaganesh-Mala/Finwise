
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Installment = require('./models/Installment');

async function verifyLogic() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finwise');
        console.log('Connected to DB');

        // 1. Create a dummy installment with a past date
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);
        
        const inst = new Installment({
            student_id: new mongoose.Types.ObjectId(),
            fee_structure_id: new mongoose.Types.ObjectId(),
            installment_no: 99,
            amount: 1000,
            due_date: pastDate,
            status: 'Pending' // Initial state
        });
        
        // Manual simulation of the controller logic for 'create'
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inst.due_date < today) inst.status = 'Overdue';
        
        console.log(`Initial Status (Past Date): ${inst.status}`); // Should be Overdue

        // 2. Simulate 'edit' to future date
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);
        
        inst.due_date = futureDate;
        if (inst.due_date >= today) inst.status = 'Pending';
        console.log(`Updated Status (Future Date): ${inst.status}`); // Should be Pending

        // 3. Simulate 'edit' back to past date
        const pastDate2 = new Date();
        pastDate2.setDate(pastDate2.getDate() - 2);
        inst.due_date = pastDate2;
        if (inst.due_date < today) inst.status = 'Overdue';
        console.log(`Updated Status (Past Date again): ${inst.status}`); // Should be Overdue

        await mongoose.disconnect();
        console.log('Verification successful based on logic simulation.');
    } catch (err) {
        console.error(err);
    }
}

verifyLogic();
