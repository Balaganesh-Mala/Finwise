const mongoose = require('mongoose');

// Course Schema
const CourseSchema = new mongoose.Schema({
    title: String,
    isBonus: {
        type: mongoose.Schema.Types.Mixed,
        default: false
    }
});

const Course = mongoose.model('Course', CourseSchema);

async function run() {
    const MONGO_URI = 'mongodb+srv://malabalaganesh_db_user:jobreadyskillscenter123@cluster0.yihtjqi.mongodb.net/jobready_skills_center';
    try {
        await mongoose.connect(MONGO_URI);
        const courses = await Course.find({}, 'title isBonus');
        console.log('--- Course Data ---');
        courses.forEach(c => {
            console.log(`Title: ${c.title} | isBonus: ${c.isBonus} | Type: ${typeof c.isBonus}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
