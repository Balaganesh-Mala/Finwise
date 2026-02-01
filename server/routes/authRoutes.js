const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Student = require('../models/Student');
const Setting = require('../models/Setting'); // Import Settings Model
const { sendEmail } = require('../utils/emailService');
const { resetPasswordTemplate } = require('../templates/emailTemplates');

// @route   POST /api/auth/request-reset
// @desc    Request password reset
// @access  Public
router.post('/request-reset', async (req, res) => {
    try {
        const { email } = req.body;
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        student.resetToken = tokenHash;
        student.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
        await student.save();

        // Create reset link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetLink = `${clientUrl}/reset-password/${resetToken}`;

        // Fetch Settings
        const settings = await Setting.findOne() || {};

        // Send email
        await sendEmail(
            student.email,
            'Password Reset Request',
            resetPasswordTemplate(student.name, resetLink, settings)
        );

        res.json({ success: true, message: 'Reset link sent to email' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const student = await Student.findOne({
            resetToken: tokenHash,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!student) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        student.passwordHash = await bcrypt.hash(newPassword, salt);
        
        // Clear token
        student.resetToken = undefined;
        student.resetTokenExpiry = undefined;
        await student.save();

        res.json({ success: true, message: 'Password reset successful' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
