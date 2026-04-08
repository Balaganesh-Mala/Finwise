const mongoose = require('mongoose');
const Student = require('./models/Student');
const BatchStudent = require('./models/BatchStudent');
const Batch = require('./models/Batch');

async function debugStudent() {
    try {
        await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center');
        console.log('Connected to DB');

        const student = await Student.findOne({ email: 'anithasaikottapalli2000@gmail.com' });
        if (!student) {
            console.log('Student not found!');
            return;
        }
        console.log('Student ID:', student._id);
        console.log('Student Name:', student.name);
        console.log('Student batchTiming:', student.batchTiming);

        const enrollments = await BatchStudent.find({ studentId: student._id }).populate('batchId');
        console.log('Enrollments found:', enrollments.length);
        enrollments.forEach(e => {
            console.log('Enrollment Batch:', e.batchId?.name);
            console.log('Enrollment Status:', e.status);
        });

        const allBS = await BatchStudent.find().limit(5);
        console.log('Sample BatchStudent records:', allBS);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

debugStudent();
