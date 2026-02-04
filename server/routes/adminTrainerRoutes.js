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
        // Email HTML Template
        const companyName = process.env.MAIL_SENDER_NAME || "Wonew Skill Up Academy";
        const loginUrl = process.env.TRAINER_URL || "http://localhost:5176";
        const logoUrl = "https://wonew.in/assets/logo.png"; // Fallback or use a real hosted logo if available

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <!-- Header -->
                <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #4f46e5;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">${companyName}</h1>
                </div>

                <!-- Body -->
                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h2 style="color: #1f2937; margin-top: 0;">Welcome to the Team!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                        We are thrilled to invite you to join us as a <strong style="color: #4f46e5;">${role}</strong>. 
                        As part of our hiring process, please log in to the Trainer Portal to complete your assessment.
                    </p>

                    <!-- Credentials Box -->
                    <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;"><strong>Portal URL:</strong> <a href="${loginUrl}/login" style="color: #4f46e5; text-decoration: none;">${loginUrl}/login</a></p>
                        <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Only One Time Password :</strong> ${password}</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${loginUrl}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Portal</a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; paddingTop: 20px;">
                        If you have any questions, feel free to reply to this email.
                    </p>
                    
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 10px; text-align: center;">
                        &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                    </p>
                </div>
            </div>
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
        const trainer = await Trainer.findById(req.params.id)
            .populate('assignedCourses', 'title')
            .populate('hiringRounds.mcq.testId'); // Populate HiringTest to get question count
            
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

// @desc    Delete Trainer
// @route   DELETE /api/admin/trainers/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        // Delete associated exams
        await TrainerExam.deleteMany({ trainerId: trainer._id });

        // Delete the trainer
        await Trainer.findByIdAndDelete(req.params.id);

        res.json({ message: 'Trainer removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
