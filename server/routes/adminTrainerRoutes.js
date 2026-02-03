const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Trainer = require('../models/Trainer');
const TrainerExam = require('../models/TrainerExam');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/emailService');

// @desc    Create Trainer Candidate
// @route   POST /api/admin/trainers/create
// @access  Admin
// @desc    Create Trainer Candidate (or Re-apply)
// @route   POST /api/admin/trainers/create
// @access  Admin
router.post('/create', async (req, res) => {
    try {
        const { name, email, role, hiringRounds } = req.body;

        // Generate Random Password
        const password = Math.random().toString(36).slice(-8);
        const ROUNDS_DEFAULT = { 
            mcq: { enabled: true, topic: '', questionCount: 15, instructions: '', customQuestions: [], testId: null }, 
            video: { enabled: true, question: '', testId: null }, 
            assignment: { enabled: true, question: '', testId: null } 
        };

        // Sanitize testId to ensure no empty strings are passed for ObjectId
        if (hiringRounds) {
            ['mcq', 'video', 'assignment'].forEach(round => {
                if (hiringRounds[round] && hiringRounds[round].testId === "") {
                    // hiringRounds[round].testId = null; // Mongoose might still try to cast, better to delete or set strictly to null
                    hiringRounds[round].testId = null; 
                }
            });
        }

        let trainer = await Trainer.findOne({ email });

        if (trainer) {
            // Re-application Logic: Update existing trainer
            trainer.name = name; // Update name if changed
            trainer.role = role;
            trainer.hiringRounds = hiringRounds || ROUNDS_DEFAULT;
            trainer.status = 'applicant';
            trainer.password = password; // Reset password for new application
            
            // If we want to reset exam progress, we might need to delete old TrainerExam? 
            // For now, let's keep old history but maybe the exam logic handles re-attempts?
            // A cleaner Re-apply usually assumes fresh start.
            // Let's delete old exam progress for a fresh start.
            await TrainerExam.deleteOne({ trainerId: trainer._id });

            await trainer.save();
        } else {
            // Create New Trainer
            trainer = await Trainer.create({
                name,
                email,
                password,
                role,
                hiringRounds: hiringRounds || ROUNDS_DEFAULT,
                status: 'applicant'
            });
        }

        // Email HTML Template
        const emailContent = `
            <h2>Welcome to JobReady Skills Center</h2>
            <p>Dear ${name},</p>
            <p>You have been invited to join our team as a <strong>${role}</strong>.</p>
            <p>Please login to the Trainer Portal to complete your hiring assessment.</p>
            <br/>
            <p><strong>Login URL:</strong> <a href="http://localhost:5176/login">http://localhost:5176/login</a></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <br/>
            <p>Best Regards,<br/>Admin Team</p>
        `;

        try {
            await sendEmail(email, "JobReady Trainer Portal - Login Credentials", emailContent);
        } catch (emailErr) {
            console.error("Failed to send email", emailErr);
        }

        res.status(201).json(trainer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get All Candidates
// @route   GET /api/admin/trainers/list
// @access  Admin
router.get('/list', async (req, res) => {
    try {
        const trainers = await Trainer.find().sort({ createdAt: -1 });
        
        const data = await Promise.all(trainers.map(async (t) => {
            let exam = null;
            if (t.status === 'applicant') {
                 exam = await TrainerExam.findOne({ trainerId: t._id });
            }
            return {
                ...t._doc,
                exam: exam || null
            };
        }));

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get Single Trainer Details (Exam, etc)
// @route   GET /api/admin/trainers/:id
// @access  Admin
router.get('/:id', async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id).populate('assignedCourses', 'title');
        if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

        const exam = await TrainerExam.findOne({ trainerId: trainer._id });

        res.json({
            ...trainer._doc,
            exam: exam || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc    Approve/Reject Candidate
// @route   PUT /api/admin/trainers/status/:id
// @access  Admin
router.put('/status/:id', async (req, res) => {
    try {
        const { status, assignedCourses } = req.body; 
        const trainer = await Trainer.findById(req.params.id);

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        if (status) trainer.status = status;
        if (assignedCourses) trainer.assignedCourses = assignedCourses;
        
        await trainer.save();

        res.json(trainer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
