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

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ postedAt: -1 });
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
        let jobData = req.body;

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

        let updateData = req.body;

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


        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(job);
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
