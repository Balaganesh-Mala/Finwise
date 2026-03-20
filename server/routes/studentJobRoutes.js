const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const StudentJobApplication = require('../models/StudentJobApplication');

// @desc    Get all active student jobs with application status for a student
// @route   GET /api/student-jobs?studentId=xxx
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { studentId } = req.query;

        // Fetch all active student-only jobs
        const jobs = await Job.find({ isActive: true, isStudentOnly: true }).sort({ postedAt: -1 });

        if (!studentId) return res.json(jobs);

        // Get this student's applications
        const applications = await StudentJobApplication.find({ studentId });
        const appliedMap = {};
        applications.forEach(app => {
            appliedMap[String(app.jobId)] = app.status;
        });

        // Attach appliedStatus to each job
        const jobsWithStatus = jobs.map(job => ({
            ...job.toObject(),
            appliedStatus: appliedMap[String(job._id)] || null
        }));

        res.json(jobsWithStatus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get all expired/closed jobs the student missed
// @route   GET /api/student-jobs/missed?studentId=xxx
// @access  Public
router.get('/missed', async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ msg: 'studentId required' });

        // Jobs that are inactive OR past deadline
        const missedJobs = await Job.find({
            isStudentOnly: true,
            $or: [
                { isActive: false },
                { deadline: { $lt: new Date() } }
            ]
        }).sort({ postedAt: -1 }).limit(20);

        // Find which ones the student didn't apply for
        const appliedJobIds = await StudentJobApplication.find({ studentId }).distinct('jobId');
        const appliedSet = new Set(appliedJobIds.map(id => String(id)));

        const notApplied = missedJobs.filter(j => !appliedSet.has(String(j._id)));
        res.json(notApplied);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get student's application stats
// @route   GET /api/student-jobs/stats?studentId=xxx
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ msg: 'studentId required' });

        const applications = await StudentJobApplication.find({ studentId });

        const stats = {
            totalApplied: applications.length,
            underReview: applications.filter(a => a.status === 'Under Review').length,
            interviews: applications.filter(a => a.status === 'Interview Scheduled').length,
            offers: applications.filter(a => a.status === 'Offer Received').length,
            rejected: applications.filter(a => a.status === 'Rejected').length,
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get student's all applications with job details
// @route   GET /api/student-jobs/my-applications?studentId=xxx
// @access  Public
router.get('/my-applications', async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ msg: 'studentId required' });

        const applications = await StudentJobApplication.find({ studentId })
            .populate('jobId')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Mark a job as applied (or update if already exists)
// @route   POST /api/student-jobs/:jobId/apply
// @access  Public
router.post('/:jobId/apply', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { studentId, notes } = req.body;

        if (!studentId) return res.status(400).json({ msg: 'studentId required' });

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Upsert — create if doesn't exist, update notes if does
        const application = await StudentJobApplication.findOneAndUpdate(
            { studentId, jobId },
            { studentId, jobId, notes: notes || '', status: 'Applied', appliedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Update application status (student updates their own progress)
// @route   PATCH /api/student-jobs/applications/:id/status
// @access  Public
router.patch('/applications/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;

        const validStatuses = ['Applied', 'Under Review', 'Interview Scheduled', 'Offer Received', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const application = await StudentJobApplication.findByIdAndUpdate(
            req.params.id,
            { status, notes: notes ?? undefined, updatedAt: new Date() },
            { new: true }
        );

        if (!application) return res.status(404).json({ msg: 'Application not found' });

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
