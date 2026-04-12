const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to Atlas");

    const Trainer = mongoose.model('Trainer', new mongoose.Schema({}, { strict: false }));
    const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    const trainers = await Trainer.find();
    console.log("Trainers:", trainers.map(t => ({ email: t.email, role: t.role, assigned: t.assignedCourses })));

    const courses = await Course.find();
    console.log("Courses:", courses.map(c => ({ id: c._id, title: c.title })));

    const students = await Student.find();
    console.log("Students:", students.map(s => ({ email: s.email, courseName: s.courseName })));

    process.exit();
}

test().catch(console.error);
