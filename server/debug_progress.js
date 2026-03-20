const mongoose = require('mongoose');

// We need to simulate the Controller logic for getStudentDashboardStats
mongoose.connect('mongodb://127.0.0.1:27017/finwise', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(async () => {
    try {
        const Student = mongoose.connection.collection('students');
        const Progress = mongoose.connection.collection('progresses');
        const BatchStudent = mongoose.connection.collection('batchstudents');
        const Course = mongoose.connection.collection('courses');
        const Module = mongoose.connection.collection('modules');
        const Topic = mongoose.connection.collection('topics');

        // Get the first student to test
        const student = await Student.findOne({});
        if (!student) {
            console.log('No students found');
            process.exit(0);
        }
        console.log('Testing for student:', student.name, student.email, student._id.toString());
        
        let courseId = null;

        // Try BatchStudent First
        const enrollment = await BatchStudent.findOne({ studentId: student._id });
        console.log('Enrollment found:', !!enrollment);
        if (enrollment && enrollment.courseId) courseId = enrollment.courseId;

        // Try distinct courseIds
        const distinctCourseIds = await Progress.distinct('courseId', { studentId: student._id });
        console.log('Distinct Course IDs from Progress:', distinctCourseIds.map(x => x?.toString()));
        if (!courseId && distinctCourseIds.length > 0) courseId = distinctCourseIds[0];

        // Try courseName
        if (!courseId && student.courseName) {
            const course = await Course.findOne({ 
                title: { $regex: new RegExp(student.courseName, 'i') } 
            });
            console.log('Course matched by name:', course?.title, course?._id?.toString());
            courseId = course ? course._id : null;
        }

        console.log('Final resolved Course ID:', courseId?.toString());

        if (courseId) {
            const modules = await Module.find({ courseId }).toArray();
            const moduleIds = modules.map(m => m._id);
            console.log('Found Modules:', moduleIds.length);

            const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
            console.log('Total Topics in Course:', totalTopics);

            const completedTopics = await Progress.countDocuments({
                studentId: student._id,
                courseId: courseId,
                completed: true
            });
            console.log('Completed Topics by Student in Course:', completedTopics);

            let batchProgress = 0;
            if (totalTopics > 0) {
                batchProgress = Math.min(100, Math.round((completedTopics / totalTopics) * 100));
            }
            console.log('Calculated Batch Progress:', batchProgress + '%');

            // Find all progress for student
            const allProgress = await Progress.find({ studentId: student._id }).toArray();
            console.log('Total progress records for student:', allProgress.length);
            console.log('Sample progress:', JSON.stringify(allProgress[0]));
        } else {
            console.log('COULD NOT RESOLVE COURSE ID');
        }

    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});
