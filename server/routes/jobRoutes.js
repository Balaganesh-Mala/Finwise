const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const stream = require('stream');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "jobready/companies" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
};

// @desc    Get all jobs (legacy/admin)
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        let query = { isActive: true };
        
        // Retain query param logic for backward compatibility or direct calls
        if (req.query.type === 'student') {
            query.isStudentOnly = true;
        } else if (req.query.type === 'client') {
            query.isStudentOnly = { $ne: true };
        }

        const jobs = await Job.find(query).sort({ postedAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get STRICT Student Jobs (with optional eligibility masking)
// @route   GET /api/jobs/fetch/student?studentId=xxx
// @access  Public
router.get('/fetch/student', async (req, res) => {
    try {
        console.log("API: Fetching STRICT Student Jobs");
        const jobs = await Job.find({ isActive: true, isStudentOnly: true }).sort({ postedAt: -1 });
        console.log(`API: Found ${jobs.length} student jobs`);

        const { studentId } = req.query;

        // If no student context, return jobs as-is (admin preview etc.)
        if (!studentId) {
            return res.json(jobs);
        }

        // Check eligibility via progress — derive courseId from Progress records directly
        let eligible = false;
        try {
            const Progress = require('../models/Progress');
            const Module = require('../models/Module');
            const Topic = require('../models/Topic');

            // Find the courseId from the student's own progress records
            const latestProgress = await Progress.findOne({ studentId })
                .sort({ updatedAt: -1 })
                .select('courseId');

            if (latestProgress) {
                const courseId = latestProgress.courseId;
                const modules = await Module.find({ courseId });
                const moduleIds = modules.map(m => m._id);
                const totalTopics = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
                const completedTopics = await Progress.countDocuments({
                    studentId,
                    courseId,
                    completed: true
                });
                const completion = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
                eligible = completion >= 75;
            }
        } catch (eligErr) {
            console.error('Eligibility check failed, defaulting to masked:', eligErr);
            eligible = false;
        }

        // Mask sensitive company fields for ineligible students
        const maskedJobs = jobs.map(job => {
            const j = job.toObject();
            if (!eligible) {
                // Use last 4 chars of ObjectId as a short identifier
                const shortId = String(j._id).slice(-4).toUpperCase();
                j.company = `Company ID: ${shortId}`;
                j.companyLogo = '';
                j.companyWebsite = '';
                j.companyLinkedin = '';
            }
            return j;
        });

        res.json(maskedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @desc    Get STRICT Client Jobs
// @route   GET /api/jobs/fetch/client
// @access  Public
router.get('/fetch/client', async (req, res) => {
    try {
        console.log("API: Fetching STRICT Client Jobs");
        const jobs = await Job.find({ isActive: true, isStudentOnly: { $ne: true } }).sort({ postedAt: -1 });
        console.log(`API: Found ${jobs.length} client jobs`);
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Admin)
router.post('/', upload.single('companyLogo'), async (req, res) => {
    try {
        // Clone body to ensure standard object behavior
        let jobData = { ...req.body };
        console.log("Creating Job. Raw Body:", req.body);

        // Explicitly handle isStudentOnly conversion from FormData string or JSON boolean
        if (jobData.isStudentOnly === 'true' || jobData.isStudentOnly === true) {
            jobData.isStudentOnly = true;
        } else if (jobData.isStudentOnly === 'false' || jobData.isStudentOnly === false) {
             jobData.isStudentOnly = false;
        }

        // Handle File Upload
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer);
                jobData.companyLogo = result.secure_url;
            } catch (uploadErr) {
                console.error('Cloudinary Upload Error:', uploadErr);
                return res.status(500).json({ msg: 'Image Upload Failed' });
            }
        }

        // Handle Array Fields if sent as JSON strings (FormData limitation)
        if (typeof jobData.skills === 'string') {
             try { jobData.skills = JSON.parse(jobData.skills); } catch (e) { jobData.skills = jobData.skills.split(',').map(s => s.trim()); }
        }
        if (typeof jobData.responsibilities === 'string') {
             try { jobData.responsibilities = JSON.parse(jobData.responsibilities); } catch (e) { /* ignore */ }
        }
        if (typeof jobData.requirements === 'string') {
             try { jobData.requirements = JSON.parse(jobData.requirements); } catch (e) { /* ignore */ }
        }

        const newJob = new Job(jobData);
        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
router.put('/:id', upload.single('companyLogo'), async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Clone body to ensure standard object behavior
        let updateData = { ...req.body };
        console.log(`PUT /api/jobs/${req.params.id} Raw Body:`, req.body);

        // Explicitly handle isStudentOnly conversion from FormData string or JSON boolean
        if (updateData.isStudentOnly === 'true' || updateData.isStudentOnly === true) {
            updateData.isStudentOnly = true;
        } else if (updateData.isStudentOnly === 'false' || updateData.isStudentOnly === false) {
            updateData.isStudentOnly = false;
        }
        
        console.log("Processed updateData:", updateData);

         // Handle File Upload
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer);
                updateData.companyLogo = result.secure_url;
            } catch (uploadErr) {
                console.error('Cloudinary Upload Error:', uploadErr);
                return res.status(500).json({ msg: 'Image Upload Failed' });
            }
        }

        // Handle Array Fields for Multipart/FormData
        if (typeof updateData.skills === 'string') {
             try { updateData.skills = JSON.parse(updateData.skills); } catch (e) { updateData.skills = updateData.skills.split(',').map(s => s.trim()); }
        }
        if (typeof updateData.responsibilities === 'string') {
             try { updateData.responsibilities = JSON.parse(updateData.responsibilities); } catch (e) { /* ignore */ }
        }
         if (typeof updateData.requirements === 'string') {
             try { updateData.requirements = JSON.parse(updateData.requirements); } catch (e) { /* ignore */ }
        }


        // Merge updates
        Object.assign(job, updateData);

        // Explicit safe-guard for isStudentOnly
        if (req.body.isStudentOnly === 'true' || req.body.isStudentOnly === true) {
            job.isStudentOnly = true;
        } else if (req.body.isStudentOnly === 'false' || req.body.isStudentOnly === false) {
             job.isStudentOnly = false;
        }

        const updatedJob = await job.save();
        console.log("Job Updated Successfully:", updatedJob.isStudentOnly);
        res.json(updatedJob);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        await job.deleteOne();
        res.json({ msg: 'Job removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
