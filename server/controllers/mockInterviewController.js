const MockInterviewFeedback = require('../models/MockInterviewFeedback');
const StudentWallet = require('../models/StudentWallet');
const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

// @desc    Submit mock interview feedback
// @route   POST /api/mock-interviews
// @access  Private (Trainer)
exports.submitFeedback = async (req, res) => {
    let createdFeedbackId = null;
    let createdTransactionIds = [];
    let initialWalletState = null;
    let isNewWallet = false;
    let wallet = null;

    try {
        const {
            studentId, interviewerName, interviewType,
            communicationScore, technicalScore, confidenceScore,
            problemSolvingScore, bodyLanguageScore, practicalScore,
            topicScores: rawTopicScores = [], strengths, weaknesses, suggestions,
            improvementPlan = [], recordingUrl, interviewDate
        } = req.body;

        // Clean topicScores: Filter out any entries with empty topic names
        const topicScores = rawTopicScores.filter(ts => ts.topic && ts.topic.trim() !== '');

        // 1. Strict Validation
        const skills = [communicationScore, technicalScore, confidenceScore, problemSolvingScore, bodyLanguageScore, practicalScore];
        if (skills.some(score => score === undefined || score < 0 || score > 10)) {
            return res.status(400).json({ success: false, message: 'Invalid skill scores. Must be between 0 and 10.' });
        }

        // 2. Duplicate Submission Protection (same day, same type, same student)
        const targetDate = interviewDate ? new Date(interviewDate) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingFeedback = await MockInterviewFeedback.findOne({
            studentId,
            interviewType,
            isSubmitted: true,
            interviewDate: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingFeedback) {
            return res.status(409).json({ success: false, message: 'Feedback for this interview type already submitted today.' });
        }

        // 3. Consistent Score Calculation
        const overallScore = Number((skills.reduce((a, b) => a + Number(b), 0) / 6).toFixed(1));

        // 4. Status Classification Logic
        let status = 'Needs Improvement';
        if (overallScore >= 9) status = 'Job Ready';
        else if (overallScore >= 7.5) status = 'Highly Capable';
        else if (overallScore >= 6) status = 'Capable';
        else if (overallScore >= 4) status = 'Needs Improvement';
        else status = 'Critical Risk';

        // 5. Weak Area Detection
        const weakAreas = [];
        const skillMapping = {
            'Communication': communicationScore, 'Technical': technicalScore,
            'Confidence': confidenceScore, 'Problem Solving': problemSolvingScore,
            'Body Language': bodyLanguageScore, 'Practical': practicalScore
        };
        for (const [key, val] of Object.entries(skillMapping)) {
            if (val < 6) weakAreas.push(key);
        }
        topicScores.forEach(ts => {
            if (ts.score < 6) weakAreas.push(ts.topic);
        });

        // 6. Basic points calculation
        const pointsEarned = Math.round(overallScore * 10);
        let coinsEarned = 15;
        if (overallScore >= 8) coinsEarned = 50;
        else if (overallScore >= 6) coinsEarned = 30;
        
        let bonusPoints = 0;
        let bonusCoins = 0;

        // 7. Previous Score Comparison (For Bonus)
        const previousFeedback = await MockInterviewFeedback.findOne({ studentId, isSubmitted: true })
            .sort({ createdAt: -1 });
        if (previousFeedback && overallScore > previousFeedback.overallScore) {
            bonusPoints = 20;
            bonusCoins = 25;
        }

        // 8. First Interview Bonus
        const totalInterviews = await MockInterviewFeedback.countDocuments({ studentId, isSubmitted: true });
        const firstInterviewBonus = (totalInterviews === 0) ? 50 : 0;
        const firstInterviewCoinsBonus = (totalInterviews === 0) ? 100 : 0;

        // Fetch Wallet for rollback safety
        wallet = await StudentWallet.findOne({ studentId });
        if (wallet) {
            initialWalletState = { totalPoints: wallet.totalPoints, totalCoins: wallet.totalCoins, level: wallet.level };
        } else {
            isNewWallet = true;
            wallet = new StudentWallet({ studentId });
        }

        // --- BEGIN MANUAL TRANSACTION ---

        // A. Insert Feedback
        const feedback = await MockInterviewFeedback.create({
            studentId, trainerId: req.user ? req.user._id : null,
            interviewerName, interviewType, overallScore,
            communicationScore, technicalScore, confidenceScore,
            problemSolvingScore, bodyLanguageScore, practicalScore,
            topicScores, strengths, weaknesses, suggestions,
            improvementPlan, recordingUrl, 
            interviewDate: interviewDate ? new Date(interviewDate) : undefined,
            status, weakAreas, isSubmitted: true,
            pointsEarned, coinsEarned, bonusPoints, bonusCoins, 
            firstInterviewBonus, firstInterviewCoinsBonus
        });
        createdFeedbackId = feedback._id;

        // B. Update Student Wallet
        const totalPointsToAdd = pointsEarned + bonusPoints + firstInterviewBonus;
        const totalCoinsToAdd = coinsEarned + bonusCoins + firstInterviewCoinsBonus;

        wallet.totalPoints += totalPointsToAdd;
        wallet.totalCoins += totalCoinsToAdd;

        // Level Logic
        if (wallet.totalPoints >= 1000) wallet.level = 4;
        else if (wallet.totalPoints >= 500) wallet.level = 3;
        else if (wallet.totalPoints >= 200) wallet.level = 2;
        else wallet.level = 1;

        await wallet.save();
        
        // Sync with primary Student points for Dashboard and Leaderboard
        await Student.findByIdAndUpdate(studentId, {
            $inc: { points: totalPointsToAdd }
        });

        // C. Record Transactions
        const transactions = [
            { studentId, type: 'points', amount: pointsEarned, reason: 'mock_interview', referenceId: feedback._id }
        ];
        if (bonusPoints > 0) transactions.push({ studentId, type: 'points', amount: bonusPoints, reason: 'improvement_bonus', referenceId: feedback._id });
        if (firstInterviewBonus > 0) transactions.push({ studentId, type: 'points', amount: firstInterviewBonus, reason: 'first_interview_bonus', referenceId: feedback._id });
        
        transactions.push({ studentId, type: 'coins', amount: coinsEarned, reason: 'mock_interview', referenceId: feedback._id });
        if (bonusCoins > 0) transactions.push({ studentId, type: 'coins', amount: bonusCoins, reason: 'improvement_bonus', referenceId: feedback._id });
        if (firstInterviewCoinsBonus > 0) transactions.push({ studentId, type: 'coins', amount: firstInterviewCoinsBonus, reason: 'first_interview_bonus', referenceId: feedback._id });

        const insertedTxns = await Transaction.insertMany(transactions);
        createdTransactionIds = insertedTxns.map(t => t._id);

        res.status(201).json({
            success: true,
            data: feedback,
            walletUpdates: {
                points: totalPointsToAdd,
                coins: totalCoinsToAdd,
                bonusApplied: bonusPoints + firstInterviewBonus,
                newTotalPoints: wallet.totalPoints,
                newTotalCoins: wallet.totalCoins,
                newLevel: wallet.level,
                performanceStatus: status
            }
        });

    } catch (err) {
        console.error('Submit Feedback Error (Attempting manual rollback):', err);
        
        // Manual Rollback Procedure
        try {
            if (createdFeedbackId) await MockInterviewFeedback.findByIdAndDelete(createdFeedbackId);
            if (createdTransactionIds.length > 0) await Transaction.deleteMany({ _id: { $in: createdTransactionIds } });
            
            if (wallet) {
                if (isNewWallet) {
                    await StudentWallet.findOneAndDelete({ studentId: wallet.studentId });
                } else if (initialWalletState) {
                    wallet.totalPoints = initialWalletState.totalPoints;
                    wallet.totalCoins = initialWalletState.totalCoins;
                    wallet.level = initialWalletState.level;
                    await wallet.save();
                }
            }
        } catch (rollbackErr) {
            console.error('Critical Rollback Failure. Data may be inconsistent:', rollbackErr);
        }

        res.status(500).json({ success: false, message: 'Server Error during submission. Changes reverted.' });
    }
};

// @desc    Get student interview performance & wallet
// @route   GET /api/mock-interviews/student/:studentId
// @access  Private
exports.getStudentPerformance = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const wallet = await StudentWallet.findOne({ studentId }) || { totalPoints: 0, totalCoins: 0, level: 1 };
        const history = await MockInterviewFeedback.find({ studentId }).sort({ createdAt: -1 });
        const transactions = await Transaction.find({ studentId }).sort({ date: -1 }).limit(10);

        res.json({
            success: true,
            wallet,
            history,
            transactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all feedacks for a student (History)
// @route   GET /api/mock-interviews/history
// @access  Private (Student)
exports.getInterviewHistory = async (req, res) => {
    try {
        const studentId = req.user._id;
        const feedbacks = await MockInterviewFeedback.find({ studentId }).sort({ createdAt: -1 });
        res.json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get ALL feedacks across all students for Admin history table
// @route   GET /api/mock-interviews/all
// @access  Private (Admin/Trainer)
exports.getAllHistory = async (req, res) => {
    try {
        // Find all mock interviews, populate student name/email/course
        const feedbacks = await MockInterviewFeedback.find({})
            .populate('studentId', 'name email courseName profilePicture')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (err) {
        console.error('Error fetching all history:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Mock Interview Feedback (Qualitative only)
// @route   PUT /api/mock-interviews/:id
// @access  Private (Admin)
exports.updateFeedback = async (req, res) => {
    try {
        const { strengths, weaknesses, suggestions, improvementPlan, interviewerName, performanceStatus, topicScores, interviewDate } = req.body;
        
        const feedback = await MockInterviewFeedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

        // Only qualitative items are updated
        if (strengths !== undefined) feedback.strengths = strengths;
        if (weaknesses !== undefined) feedback.weaknesses = weaknesses;
        if (suggestions !== undefined) feedback.suggestions = suggestions;
        if (improvementPlan !== undefined) feedback.improvementPlan = improvementPlan;
        if (interviewerName !== undefined) feedback.interviewerName = interviewerName;
        if (performanceStatus !== undefined) feedback.performanceStatus = performanceStatus;
        if (topicScores !== undefined) feedback.topicScores = topicScores;
        if (interviewDate !== undefined) feedback.interviewDate = interviewDate ? new Date(interviewDate) : undefined;

        await feedback.save();
        res.status(200).json({ success: true, data: feedback });
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete Mock Interview & Revert Gamification
// @route   DELETE /api/mock-interviews/:id
// @access  Private (Admin)
exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const feedback = await MockInterviewFeedback.findById(feedbackId);
        
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

        // Revert Gamification
        const transactions = await Transaction.find({ referenceId: feedbackId });
        
        if (transactions.length > 0) {
            let pointsToRevert = 0;
            let coinsToRevert = 0;

            transactions.forEach(t => {
                if (t.type === 'points') pointsToRevert += t.amount;
                if (t.type === 'coins') coinsToRevert += t.amount;
            });

            const wallet = await StudentWallet.findOne({ studentId: feedback.studentId });
            if (wallet) {
                wallet.totalPoints = Math.max(0, wallet.totalPoints - pointsToRevert);
                wallet.totalCoins = Math.max(0, wallet.totalCoins - coinsToRevert);
                // Recalculate level
                if (wallet.totalPoints >= 1000) wallet.level = 4;
                else if (wallet.totalPoints >= 500) wallet.level = 3;
                else if (wallet.totalPoints >= 200) wallet.level = 2;
                else wallet.level = 1;
                
                await wallet.save();

                // Revert global student points
                await Student.findByIdAndUpdate(feedback.studentId, {
                    $inc: { points: -pointsToRevert }
                });
            }

            // Remove transactions
            await Transaction.deleteMany({ referenceId: feedbackId });
        }

        // Remove feedback
        await MockInterviewFeedback.findByIdAndDelete(feedbackId);

        res.status(200).json({ success: true, message: 'Feedback deleted and points reverted successfully.' });
    } catch (err) {
        console.error('Error deleting feedback:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
