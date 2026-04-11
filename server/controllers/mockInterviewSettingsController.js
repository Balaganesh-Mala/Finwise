const MockInterviewSettings = require('../models/MockInterviewSettings');

// @desc    Get Mock Interview Settings
// @route   GET /api/mock-interview-settings
// @access  Public (or Trainer/Admin)
exports.getSettings = async (req, res) => {
    try {
        let settings = await MockInterviewSettings.findOne();
        if (!settings) {
            settings = await MockInterviewSettings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error('Error fetching mock interview settings:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Mock Interview Settings
// @route   PUT /api/mock-interview-settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        const { topics, improvementPlans, skillLabels, interviewTypes } = req.body;
        
        let settings = await MockInterviewSettings.findOne();
        if (!settings) {
            settings = new MockInterviewSettings({});
        }

        if (topics !== undefined) settings.topics = topics;
        if (improvementPlans !== undefined) settings.improvementPlans = improvementPlans;
        if (skillLabels !== undefined) settings.skillLabels = skillLabels;
        if (interviewTypes !== undefined) settings.interviewTypes = interviewTypes;
        settings.updatedAt = Date.now();

        await settings.save();
        
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error('Error updating mock interview settings:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
