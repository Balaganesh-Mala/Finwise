const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer (Temp storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    // Create dir if not exists
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// @desc    Submit new application with resume
// @route   POST /api/applications
// @access  Public
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No resume file uploaded' });
        }

        console.log('File received:', req.file);
        if (req.file.size === 0) {
            return res.status(400).json({ msg: 'File is empty' });
        }

        // Upload to Cloudinary (RAW mode for stable downloads)
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'job_applications',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true
        });

        console.log('Cloudinary Upload Result:', result);


        // Remove file from local temp folder
        fs.unlinkSync(req.file.path);

        // Parse consent (it comes as stringified JSON from FormData)
        let consentData = {};
        try {
            consentData = JSON.parse(req.body.consent);
        } catch (e) {
            consentData = req.body.consent; 
        }

        const newApplication = new Application({
            jobId: req.body.jobId,
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            resumeUrl: result.secure_url,
            resumePublicId: result.public_id,
            consent: consentData
        });

        const application = await newApplication.save();
        res.json(application);

    } catch (err) {
        console.error('Application Error:', err);
        // Attempt clean up if upload worked but DB failed (optional but good practice)
        if (req.file && fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
        }
        res.status(500).send('Server Error');
    }
});

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin)
router.get('/', async (req, res) => {
    try {
        // Populate job details to show Job Title in admin table
        const applications = await Application.find()
            .populate('jobId', 'title company')
            .sort({ appliedAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Deleting file from Cloudinary (Optional but good practice)
        if (application.resumePublicId) {
             await cloudinary.uploader.destroy(application.resumePublicId);
        }

        await application.deleteOne();
        res.json({ msg: 'Application removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Download resume (Redirect to Signed URL)
// @route   GET /api/applications/:id/download
// @access  Private (Admin)
router.get('/:id/download', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.resumeUrl) {
            return res.status(404).json({ msg: 'File not found' });
        }

        console.log('Original Resume URL:', application.resumeUrl);

        // Extract version
        const versionMatch = application.resumeUrl.match(/\/v(\d+)\//);
        const version = versionMatch ? versionMatch[1] : undefined;

        console.log('Generating Authenticated Access URL...');

        // CRITICAL: Force type to 'authenticated' (or 'private') instead of 'upload'
        // Raw files often default to this for security.
        const signedUrl = cloudinary.url(application.resumePublicId, {
            resource_type: 'raw',
            type: 'authenticated', // Changed from 'upload' to 'authenticated'
            sign_url: true,
            flags: 'attachment',
            version: version, 
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });

        console.log('Redirecting to Signed Auth URL:', signedUrl);
        
        // Redirect the user. Cloudinary will validate the signature and serve the file.
        res.redirect(signedUrl);

    } catch (err) {
        console.error('Download Redirect Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
