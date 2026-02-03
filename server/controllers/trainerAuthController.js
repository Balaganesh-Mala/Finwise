const Trainer = require('../models/Trainer');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Trainer Login
// @route   POST /api/trainer/auth/login
// @access  Public
exports.loginTrainer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for trainer
        const trainer = await Trainer.findOne({ email });
        if (!trainer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        if (await trainer.matchPassword(password)) {
            res.json({
                success: true,
                _id: trainer._id,
                name: trainer.name,
                email: trainer.email,
                role: trainer.role,
                status: trainer.status,
                token: generateToken(trainer._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current trainer profile
// @route   GET /api/trainer/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.user.id)
            .select('-password')
            .populate('hiringRounds.mcq.testId')
            .populate('hiringRounds.video.testId')
            .populate('hiringRounds.assignment.testId');
        res.json(trainer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
