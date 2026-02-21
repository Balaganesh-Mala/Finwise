const mongoose = require('mongoose');

const TopicContentSchema = new mongoose.Schema({
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
        unique: true // One content doc per topic
    },
    // MCQ: references a HiringTest of type 'mcq'
    mcqTest: {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringTest', default: null },
        enabled: { type: Boolean, default: false }
    },
    // Tasks (text/file-based challenges)
    tasks: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        fileUrl: { type: String, default: '' },    // optional resource file
        filePublicId: { type: String, default: '' }
    }],
    // Assignments (PDF question, students upload answer)
    assignments: [{
        title: { type: String, required: true },
        questionUrl: { type: String, default: '' },    // question PDF
        questionPublicId: { type: String, default: '' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('TopicContent', TopicContentSchema);
