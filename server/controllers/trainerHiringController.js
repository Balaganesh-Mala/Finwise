const Trainer = require('../models/Trainer');
const TrainerExam = require('../models/TrainerExam');
const { sendEmail } = require('../utils/emailService');

// @desc    Get Exam Details/Status
// @route   GET /api/trainer/exam/status
// @access  Private
exports.getExamStatus = async (req, res) => {
    try {
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) {
            // Create initial exam record if not pending
            exam = await TrainerExam.create({ trainerId: req.user.id });
        }
        res.json(exam);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit MCQ
// @route   POST /api/trainer/exam/mcq/submit
// @access  Private
exports.submitMCQ = async (req, res) => {
    try {
        const { score, answers } = req.body;
        
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) {
            exam = new TrainerExam({ trainerId: req.user.id });
        }

        exam.mcqScore = score;
        exam.mcqAnswers = answers;
        await exam.save();

        res.json({ success: true, message: 'MCQ Submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload Video URL (after upload to cloudinary on frontend/backend)
// @route   POST /api/trainer/exam/video/save
// @access  Private
exports.saveVideo = async (req, res) => {
    try {
        const { videoUrl } = req.body;
        
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) exam = new TrainerExam({ trainerId: req.user.id });

        exam.videoUrl = videoUrl;
        await exam.save();

        res.json({ success: true, message: 'Video Saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save Assignment URLs
// @route   POST /api/trainer/exam/assignment/save
// @access  Private
exports.saveAssignment = async (req, res) => {
    try {
        const { assignments } = req.body; // Array of URLs
        
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) exam = new TrainerExam({ trainerId: req.user.id });

        exam.assignments = assignments;
        await exam.save();

        res.json({ success: true, message: 'Assignments Saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit Written Test
// @route   POST /api/trainer/exam/written/submit
// @access  Private
exports.submitWritten = async (req, res) => {
    try {
        const { content } = req.body;
        
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) exam = new TrainerExam({ trainerId: req.user.id });

        exam.writtenTest = content;
        await exam.save();

        res.json({ success: true, message: 'Written Test Saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Final Submission
// @route   POST /api/trainer/exam/submit
// @access  Private
exports.submitExam = async (req, res) => {
    try {
        let exam = await TrainerExam.findOne({ trainerId: req.user.id });
        if (!exam) return res.status(404).json({ message: 'Exam not started' });

        exam.status = 'submitted';
        await exam.save();

        // Notify Admin via Email
        const adminEmail = process.env.MAIL_SENDER_EMAIL; // Or fetch first admin
        const emailContent = `
            <h2>New Trainer Exam Submission</h2>
            <p><strong>Trainer:</strong> ${req.user.name}</p>
            <p><strong>Role:</strong> ${req.user.role}</p>
            <p><strong>MCQ Score:</strong> ${exam.mcqScore}</p>
            <p>Login to the Admin Portal to review the full submission (Video, Assignments).</p>
        `;
        
        // Don't await email so we don't block response
        sendEmail(adminEmail, "Trainer Exam Submitted", emailContent).catch(err => console.error(err));

        res.json({ success: true, message: 'Exam Submitted for Review' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
