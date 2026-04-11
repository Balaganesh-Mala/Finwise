const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center';

async function checkEnrollment() {
    try {
        await mongoose.connect(MONGO_URI);
        
        const Course = mongoose.model('Course', new mongoose.Schema({ title: String }));
        const BatchStudent = mongoose.model('BatchStudent', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, courseId: mongoose.Schema.Types.ObjectId }));
        const StudentCourse = mongoose.model('StudentCourse', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, courseId: mongoose.Schema.Types.ObjectId }));
        const Student = mongoose.model('Student', new mongoose.Schema({ name: String }));

        // 1. Find KYC Course
        const kycCourse = await Course.findOne({ title: /KYC & AML/ });
        if (!kycCourse) {
            console.log("Course not found");
            process.exit(0);
        }
        console.log(`Course Found: ${kycCourse.title} (${kycCourse._id})`);

        // 2. Find any Student who has it unlocked
        const studentCourseEnt = await StudentCourse.find({ courseId: kycCourse._id });
        console.log(`\n--- Direct Purchases (StudentCourse) --- count: ${studentCourseEnt.length}`);
        for (const ent of studentCourseEnt) {
            const student = await Student.findById(ent.studentId);
            console.log(`- Student: ${student?.name || 'Unknown'} (${ent.studentId})`);
        }

        // 3. Find any Batch Enrollments
        const batchEnt = await BatchStudent.find({ courseId: kycCourse._id });
        console.log(`\n--- Batch Enrollments (BatchStudent) --- count: ${batchEnt.length}`);
        for (const ent of batchEnt) {
            const student = await Student.findById(ent.studentId);
            console.log(`- Student: ${student?.name || 'Unknown'} (${ent.studentId})`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEnrollment();
