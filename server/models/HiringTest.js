const mongoose = require('mongoose');

const hiringTestSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    type: { 
        type: String, 
        enum: ['mcq', 'video', 'assignment'], 
        required: true 
    },
    
    // For MCQ
    questions: [{
        questionText: { type: String },
        options: [{ type: String }], // Array of options strings
        correctAnswers: [{ type: String }], // Array of correct option strings
        isMultiple: { type: Boolean, default: false } // Checkbox vs Radio
    }],

    // For Video / Assignment (and MCQ instructions)
    instructions: { type: String, default: '' },
    
    // For Video/Assignment specific
    prompt: { type: String }, // e.g. "Record specific video..."
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HiringTest', hiringTestSchema);
