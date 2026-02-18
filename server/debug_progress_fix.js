const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Topic = require('./models/Topic');
const Progress = require('./models/Progress');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const debugProgress = async () => {
    await connectDB();

    console.log("\n--- DEBUGGING PROGRESS ---");

    const students = await Student.find({});
    console.log(`Total Students: ${students.length}`);

    const courses = await Course.find({});
    console.log(`Total Courses: ${courses.length}`);
    courses.forEach(c => console.log(`Course: "${c.title}" (ID: ${c._id})`));

    for (const student of students) {
        console.log(`\nChecking Student: ${student.name} (${student.email})`);
        console.log(`Student Course Name: "${student.courseName}"`);

        if (!student.courseName) {
            console.log("No course name set.");
            continue;
        }

        // Try to find course
        const course = await Course.findOne({ 
            title: { $regex: new RegExp(`^${student.courseName}$`, 'i') } 
        });

        if (!course) {
            console.log(`ERROR: Could not find course matching "${student.courseName}"`);
            
            // Try partial match to see if it's a naming issue
            const partial = await Course.findOne({ title: { $regex: student.courseName, $options: 'i' } });
            if (partial) console.log(`Did you mean: "${partial.title}"?`);
            continue;
        }

        console.log(`Found Course: "${course.title}" (${course._id})`);

        // Check Modules & Topics
        const modules = await Module.find({ courseId: course._id }).select('_id');
        const moduleIds = modules.map(m => m._id);
        const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
        console.log(`Total Topics in Course: ${totalTopics}`);

        // Check Progress
        const allProgress = await Progress.find({ studentId: student._id });
        console.log(`Total Progress Records for Student: ${allProgress.length}`);
        
        const completedProgress = await Progress.countDocuments({ 
            studentId: student._id, 
            courseId: course._id, 
            completed: true 
        });
        console.log(`Completed Topics (status=true): ${completedProgress}`);

        let percentage = 0;
        if (totalTopics > 0) percentage = Math.round((completedProgress / totalTopics) * 100);
        console.log(`CALCULATED PERCENTAGE: ${percentage}%`);
    }

    process.exit();
};

debugProgress();
