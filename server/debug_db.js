const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');
const Module = require('./models/Module');
const Topic = require('./models/Topic');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const courses = await Course.find({});
        console.log('\n--- COURSES ---');
        courses.forEach(c => console.log(`ID: ${c._id}, Title: "${c.title}"`));

        const modules = await Module.find({});
        console.log('\n--- MODULES ---');
        modules.forEach(m => console.log(`ID: ${m._id}, Title: "${m.title}", CourseID: ${m.courseId}`));

        const topics = await Topic.find({});
        console.log('\n--- TOPICS ---');
        topics.forEach(t => console.log(`ID: ${t._id}, Title: "${t.title}", ModuleID: ${t.moduleId}`));
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
