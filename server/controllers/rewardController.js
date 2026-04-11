const Course = require('../models/Course');
const StudentCourse = require('../models/StudentCourse');
const StudentWallet = require('../models/StudentWallet');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Get all bonus courses for student store
// @route   GET /api/rewards/store
// @access  Private/Student
exports.getStoreCourses = async (req, res) => {
    try {
        const studentId = req.query.studentId;
        // Fetch only active bonus courses
        const courses = await Course.find({ isBonus: true }).sort({ createdAt: -1 });
        
        // Fetch courses already unlocked by this student (Manual buy)
        const unlocked = await StudentCourse.find({ studentId }).select('courseId');
        
        // ALSO fetch courses the student is already enrolled in via BatchStudent (Manual grant/assign)
        const BatchStudent = require('../models/BatchStudent');
        const enrollments = await BatchStudent.find({ studentId }).select('courseId');

        // Combine IDs
        const unlockedIds = [
            ...unlocked.map(u => u.courseId.toString()),
            ...enrollments.map(e => e.courseId?.toString()).filter(Boolean)
        ];

        // Mark courses as unlocked for the UI
        const coursesWithStatus = courses.map(course => ({
            ...course._doc,
            isUnlocked: unlockedIds.includes(course._id.toString())
        }));

        res.json(coursesWithStatus);
    } catch (err) {
        console.error('Error fetching store courses:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getStudentWallet = async (req, res) => {
    try {
        const { studentId } = req.params;
        const Student = require('../models/Student');
        
        // Fetch base student points (Dashboard truth)
        const student = await Student.findById(studentId).select('points');
        
        let wallet = await StudentWallet.findOne({ studentId });
        
        if (!wallet) {
            // Create a wallet if it doesn't exist, initializing with current student points
            wallet = new StudentWallet({ 
                studentId,
                totalPoints: student?.points || 0
            });
            await wallet.save();
        } else if (student && wallet.totalPoints !== student.points) {
            // Sync logic: If student has more points (earned elsewhere), update wallet
            // If they have fewer (spent elsewhere?), we trust the student record as global truth
            wallet.totalPoints = student.points;
            await wallet.save();
        }

        res.json({
            success: true,
            totalPoints: student?.points || 0,
            totalCoins: wallet.totalCoins,
            level: wallet.level
        });
    } catch (err) {
        console.error('Error fetching wallet:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Purchase a bonus course using coins/points
// @route   POST /api/rewards/purchase
// @access  Private/Student
exports.purchaseCourse = async (req, res) => {
    const { studentId, courseId } = req.body;
    let deductionApplied = false;
    let deductionType = null;
    let deductionAmount = 0;

    try {
        // 1. Fetch Course and Wallet
        const course = await Course.findById(courseId);
        if (!course || !course.isBonus) {
            return res.status(404).json({ success: false, message: 'Course not found or not a reward' });
        }

        // Check if already unlocked
        const existingUnlock = await StudentCourse.findOne({ studentId, courseId });
        if (existingUnlock) {
            return res.status(400).json({ success: false, message: 'Course already unlocked' });
        }

        const wallet = await StudentWallet.findOne({ studentId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Student wallet not found' });
        }

        // 2. Validate Balance based on Pricing Type
        const { pricingType, priceCoins, pricePoints } = course;
        let updateQuery = {};

        if (pricingType === 'coins_only') {
            if (wallet.totalCoins < priceCoins) return res.status(400).json({ success: false, message: 'Insufficient coins' });
            updateQuery = { $inc: { totalCoins: -priceCoins } };
            deductionType = 'coins';
            deductionAmount = priceCoins;
        } else if (pricingType === 'points_only') {
            if (wallet.totalPoints < pricePoints) return res.status(400).json({ success: false, message: 'Insufficient points' });
            updateQuery = { $inc: { totalPoints: -pricePoints } };
            deductionType = 'points';
            deductionAmount = pricePoints;
        } else if (pricingType === 'coins_and_points') {
            if (wallet.totalCoins < priceCoins || wallet.totalPoints < pricePoints) {
                return res.status(400).json({ success: false, message: 'Insufficient coins or points' });
            }
            updateQuery = { $inc: { totalCoins: -priceCoins, totalPoints: -pricePoints } };
            // For transaction logging, we might need two logs or a specific record. 
            // We'll log as coins mainly or a custom reason.
            deductionType = 'coins_and_points'; 
        } else if (pricingType === 'free') {
            // No deduction needed
        }

        // 3. Atomically Deduct Wallet
        if (Object.keys(updateQuery).length > 0) {
            const updatedWallet = await StudentWallet.findOneAndUpdate(
                { studentId, ...(deductionType === 'coins' ? { totalCoins: { $gte: priceCoins } } : deductionType === 'points' ? { totalPoints: { $gte: pricePoints } } : {}) },
                updateQuery,
                { new: true }
            );

            if (!updatedWallet) {
                return res.status(400).json({ success: false, message: 'Transaction failed: Insufficient funds (Concurrency check)' });
            }
            deductionApplied = true;
        }

        // 4. Grant Course Access
        try {
            const newUnlock = new StudentCourse({
                studentId,
                courseId,
                accessType: 'purchased'
            });
            await newUnlock.save();

            // 4a. SYNC: Deduct points from Student record if points were used
            if (deductionType === 'points' || deductionType === 'coins_and_points') {
                const Student = require('../models/Student');
                await Student.findByIdAndUpdate(studentId, { $inc: { points: -pricePoints } });
            }

            // 5. Log Transactions
            if (deductionType === 'coins' || deductionType === 'coins_and_points') {
                await Transaction.create({
                    studentId,
                    type: 'coins',
                    amount: priceCoins,
                    reason: `Unlocked Course: ${course.title}`,
                    referenceId: courseId
                });
            }
            if (deductionType === 'points' || deductionType === 'coins_and_points') {
                await Transaction.create({
                    studentId,
                    type: 'points',
                    amount: pricePoints,
                    reason: `Unlocked Course: ${course.title}`,
                    referenceId: courseId
                });
            }

            res.json({ success: true, message: 'Course unlocked successfully!', courseId });

        } catch (innerErr) {
            // ROLLBACK Step: Refund the student if record creation fails
            console.error('Critical Err: Granting access failed. Rolling back transaction.', innerErr);
            if (deductionApplied) {
                const refundQuery = {};
                if (deductionType === 'coins' || deductionType === 'coins_and_points') refundQuery.totalCoins = priceCoins;
                if (deductionType === 'points' || deductionType === 'coins_and_points') refundQuery.totalPoints = pricePoints;
                
                await StudentWallet.findOneAndUpdate({ studentId }, { $inc: refundQuery });
            }
            throw innerErr;
        }

    } catch (err) {
        console.error('Purchase Course Error:', err);
        res.status(500).json({ success: false, message: 'Transaction failed. Please try again.' });
    }
};

// @desc    Admin manually grants a course to a student
// @route   POST /api/rewards/grant
// @access  Private/Admin
exports.adminGrantCourse = async (req, res) => {
    const { studentId, courseId } = req.body;

    try {
        const existingUnlock = await StudentCourse.findOne({ studentId, courseId });
        if (existingUnlock) {
            return res.status(400).json({ success: false, message: 'Student already has access to this course' });
        }

        const newUnlock = new StudentCourse({
            studentId,
            courseId,
            accessType: 'granted'
        });
        await newUnlock.save();

        // Optional: Log a 0-cost transaction for audit
        await Transaction.create({
            studentId,
            type: 'coins',
            amount: 0,
            reason: `Admin Granted Course: (Course ID: ${courseId})`,
            referenceId: studentId // Using studentId as reference for grants
        });

        res.json({ success: true, message: 'Course granted successfully' });
    } catch (err) {
        console.error('Admin Grant Error:', err);
        res.status(500).json({ success: false, message: 'Failed to grant course' });
    }
};

// @desc    Get all bonus courses unlocked by a student
// @route   GET /api/rewards/my-bonus-courses/:studentId
// @access  Private/Student
exports.getMyBonusCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const unlocked = await StudentCourse.find({ studentId }).populate('courseId');
        
        // Return only courses that still exist
        const courses = unlocked
            .filter(u => u.courseId)
            .map(u => ({
                ...u.courseId._doc,
                unlockedAt: u.unlockedAt,
                accessType: u.accessType
            }));

        res.json(courses);
    } catch (err) {
        console.error('Error fetching student bonus courses:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
