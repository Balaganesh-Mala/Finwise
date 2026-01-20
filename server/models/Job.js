const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    company: {
        type: String,
        required: [true, 'Please add a company name']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        required: [true, 'Please add job type (Full-time, Contract, etc.)'],
        default: 'Full-time'
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    skills: {
        type: [String],
        required: [true, 'Please add required skills']
    },
    responsibilities: {
        type: [String],
        default: []
    },
    requirements: {
         type: [String],
         default: []
    },
    salary: {
        type: String,
        required: [true, 'Please add salary range']
    },
    applyLink: {
        type: String
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Job', JobSchema);
