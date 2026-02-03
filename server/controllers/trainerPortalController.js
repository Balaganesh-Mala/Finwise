const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const TrainerAttendance = require('../models/TrainerAttendance');
const Student = require('../models/Student');
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
        // Possibly join with Exam status
        // const populatedCandidates = await Promise.all(candidates.map(async (c) => {
        //     const exam = await TrainerExam.findOne({ trainerId: c._id });
        //     return { ...c._doc, examStatus: exam ? exam.status : 'not_started' };
        // }));
        res.json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Trainer Students
exports.getStudents = async (req, res) => {
    // ... existing getStudents code ...
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
