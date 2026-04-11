const mongoose = require('mongoose');

const MockInterviewSettingsSchema = new mongoose.Schema({
    topics: {
        type: [String],
        default: ['KYC', 'AML', 'Excel', 'Trade Life Cycle', 'Corporate Actions', 'Reconciliation', 'Financial Statements', 'Journal Entries']
    },
    improvementPlans: {
        type: [String],
        default: [
            'Revise KYC & AML frameworks',
            'Practice advanced Excel functions',
            'Improve Corporate Actions knowledge',
            'Improve Journal entries'
        ]
    },
    skillLabels: {
        type: [String],
        default: ['Communication Skills', 'Technical Knowledge', 'Confidence', 'Problem Solving', 'Body Language', 'Domain / Practical Skills']
    },
    interviewTypes: {
        type: [String],
        default: ['HR', 'Technical', 'Finance', 'Mixed']
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MockInterviewSettings', MockInterviewSettingsSchema);
