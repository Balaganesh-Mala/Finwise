const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const TrainerAttendance = require('../models/TrainerAttendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const mongoose = require('mongoose');

// @desc    Get Trainer Dashboard Stats
// @route   GET /api/trainer/dashboard
// @access  Private (Trainer)
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get Today's Classes
        const todaysClasses = await Class.find({
            trainerId: req.user.id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        const totalClasses = await Class.countDocuments({ trainerId: req.user.id });
        
        res.json({
            todaysClasses,
            totalClasses,
            // Add student stats etc here
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Classes
// @route   GET /api/trainer/classes
// @access  Private
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ trainerId: req.user.id }).sort({ date: 1 });
        res.json(classes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create/Schedule Class
// @route   POST /api/trainer/classes
// @access  Private
exports.createClass = async (req, res) => {
    try {
        const { batchId, date, topic, meetingLink } = req.body;
        
        const newClass = await Class.create({
            trainerId: req.user.id,
            batchId,
            date,
            topic,
            meetingLink
        });

        res.status(201).json(newClass);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark Attendance (for Trainer themselves or students) - Assuming Trainer Self Attendance for now
// @route   POST /api/trainer/attendance/mark
// @access  Private
exports.markAttendance = async (req, res) => {
    try {
        const { present } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await TrainerAttendance.findOne({
            trainerId: req.user.id,
            date: today
        });

        if (attendance) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        attendance = await TrainerAttendance.create({
            trainerId: req.user.id,
            date: today,
            present,
            checkInTime: new Date()
        });

        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Admin Candidates (For Admin actions)
// @route   GET /api/admin/trainers/candidates
// @access  Admin
exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Trainer.find({ status: 'applicant' });
        res.json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Trainer Students
exports.getStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const courseFilter = req.query.course || 'All';
        const skip = (page - 1) * limit;

        // 1. Identify Trainer's Courses
        const trainer = await Trainer.findById(req.user.id).populate('assignedCourses');
        let allowedCourses = [];

        if (trainer.assignedCourses && trainer.assignedCourses.length > 0) {
            allowedCourses = trainer.assignedCourses.map(c => c.title);
        } else if (trainer.role) {
            let searchKeyword = '';
            if (trainer.role.includes('MS Office')) searchKeyword = 'MS Office';
            else if (trainer.role.includes('Spoken English')) searchKeyword = 'Spoken English';
            else if (trainer.role.includes('Coding')) searchKeyword = 'Full Stack';

            if (searchKeyword) {
                const Course = mongoose.model('Course');
                const matchingCourses = await Course.find({ 
                    title: { $regex: searchKeyword, $options: 'i' } 
                });
                allowedCourses = matchingCourses.map(c => c.title);
            }
        }
        
        // 2. Build Query
        let query = {};
        if (allowedCourses.length > 0) {
            query.courseName = { $in: allowedCourses };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (courseFilter !== 'All') {
            query.courseName = courseFilter;
        }

        // 3. Execute Query
        const total = await Student.countDocuments(query);
        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-passwordHash')
            .lean(); // Convert into a plain JS object so we can append properties

        // 4. Calculate Progress for each student
        const studentsWithProgress = await Promise.all(students.map(async (student) => {
            let progressData = { percentage: 0, completed: 0, total: 0 };
            
            if (student.courseName) {
                // Find course to look up modules/topics
                const course = await Course.findOne({ title: student.courseName });
                
                if (course) {
                    // Get all modules for this course
                    const modules = await Module.find({ courseId: course._id });
                    const moduleIds = modules.map(m => m._id);
                    
                    // Get total topics count
                    const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
                    
                    // Get completed topics count for this student
                    const completedCount = await Progress.countDocuments({ 
                        studentId: student._id,
                        completed: true,
                        courseId: course._id 
                    });

                    progressData = {
                        percentage: totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0,
                        completed: completedCount,
                        total: totalTopics
                    };
                }
            }

            return { ...student, progress: progressData };
        }));

        res.json({
            students: studentsWithProgress,
            page,
            pages: Math.ceil(total / limit),
            total
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Assigned Courses for Trainer
// @route   GET /api/trainer/courses
// @access  Private
exports.getTrainerCourses = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.user.id).populate('assignedCourses');
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        let courses = trainer.assignedCourses || [];

        // FALLBACK: If no courses are explicitly assigned, try to find matching courses based on Role
        if (courses.length === 0 && trainer.role) {
            let searchKeyword = '';
            if (trainer.role.includes('MS Office')) searchKeyword = 'MS Office';
            else if (trainer.role.includes('Spoken English')) searchKeyword = 'Spoken English';
            else if (trainer.role.includes('Coding')) searchKeyword = 'Full Stack'; // Example mapping

            if (searchKeyword) {
                const Course = mongoose.model('Course');
                // Case-insensitive regex search
                const matchingCourses = await Course.find({ 
                    title: { $regex: searchKeyword, $options: 'i' } 
                });
                courses = matchingCourses;
            }
        }

        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
