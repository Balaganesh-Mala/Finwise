const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer (Memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, originalName, mimeType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'job_applications',
                resource_type: 'image', // 'image' type supports PDFs and serves them publicly
                use_filename: true,
                unique_filename: true,
            },
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

// ... (routes) ...

// NOTE: Duplicate streaming route REMOVED. Now handled by the route below.

// @desc    Submit new application with resume file OR resume URL
// @route   POST /api/applications
// @access  Public
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        const hasFile = !!req.file;
        const hasUrl = !!req.body.resumeUrl && req.body.resumeUrl.trim().length > 5;

        if (!hasFile && !hasUrl) {
            return res.status(400).json({ msg: 'Please upload a resume file or provide a resume URL' });
        }

        // Parse consent
        let consentData = {};
        try {
            consentData = JSON.parse(req.body.consent);
        } catch (e) {
            consentData = req.body.consent;
        }

        let resumeUrl = null;
        let resumePublicId = null;

        if (hasFile) {
            if (req.file.mimetype !== 'application/pdf') {
                return res.status(400).json({ msg: 'Only PDF files are allowed' });
            }
            console.log('File received:', req.file.originalname, 'Size:', req.file.size);
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
            console.log('Cloudinary Upload Result:', result);
            resumeUrl = result.secure_url;
            resumePublicId = result.public_id;
        } else {
            resumeUrl = req.body.resumeUrl.trim();
            console.log('Resume URL provided:', resumeUrl);
        }

        const newApplication = new Application({
            jobId: req.body.jobId,
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            resumeUrl,
            resumePublicId,
            consent: consentData
        });

        const application = await newApplication.save();
        res.json(application);

    } catch (err) {
        console.error('Application Error:', err);
        res.status(500).send('Server Error: ' + err.message);
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
             await cloudinary.uploader.destroy(application.resumePublicId, { resource_type: 'image' });
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

        const isInline = req.query.inline === 'true';

        // If Inline (View), just redirect to the public secure URL
        if (isInline) {
             console.log('Redirecting to Inline View:', application.resumeUrl);
             return res.redirect(application.resumeUrl);
        }

        // For Download, manually construct the URL to avoid SDK mismatches or signature issues.
        // We need to inject 'fl_attachment' into the URL.
        // Standard URL: https://res.cloudinary.com/cloudname/raw/upload/v1234/folder/file.pdf
        // Target: https://res.cloudinary.com/cloudname/raw/upload/fl_attachment/v1234/folder/file.pdf
        
        // Split by '/upload/'
        let downloadUrl = application.resumeUrl;
        if (downloadUrl.includes('/upload/')) {
            downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
        } else {
            // Fallback if URL structure is weird (e.g. no upload segment? Unlikely for Cloudinary)
            console.warn('URL structure unexpected, redirecting to original:', application.resumeUrl);
        }

        console.log('Redirecting to Manual Download URL:', downloadUrl);
        
        // Add cache buster to prevent browser caching of previous 302s
        const redirectUrl = new URL(downloadUrl);
        redirectUrl.searchParams.set('t', Date.now());

        res.redirect(redirectUrl.toString());

    } catch (err) {
        console.error('Download Redirect Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Preview Resume (Server-side proxy, streams PDF with correct headers)
// @route   GET /api/applications/:id/preview
// @access  Private (Admin)
router.get('/:id/preview', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.resumeUrl) {
            return res.status(404).json({ msg: 'File not found' });
        }

        // If there's no Cloudinary publicId, this was submitted as a direct URL (Google Drive, etc.)
        // We can't proxy it as PDF — return the URL so the frontend can open it
        if (!application.resumePublicId) {
            return res.json({ directUrl: application.resumeUrl });
        }

        const resumeUrl = application.resumeUrl;
        const isOldRawUrl = resumeUrl.includes('/raw/');

        let fetchUrl = resumeUrl;

        // For old raw-type uploads, generate a signed URL so Cloudinary allows fetching
        if (isOldRawUrl && application.resumePublicId) {
            fetchUrl = cloudinary.url(application.resumePublicId, {
                resource_type: 'raw',
                sign_url: true,
                secure: true,
            });
        }

        let fileResponse;
        try {
            fileResponse = await axios({
                url: fetchUrl,
                method: 'GET',
                responseType: 'stream',
                timeout: 20000
            });
        } catch (upstreamErr) {
            console.error('Cloudinary fetch failed:', upstreamErr.message);
            return res.status(422).json({
                msg: 'This resume was uploaded in an older format and cannot be previewed directly. Please ask the applicant to resubmit.',
                code: 'OLD_FORMAT'
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
        res.setHeader('Cache-Control', 'no-cache');

        fileResponse.data.pipe(res);

    } catch (err) {
        console.error('Preview Error:', err.message);
        res.status(500).json({ msg: 'Failed to preview resume', error: err.message });
    }
});


module.exports = router;
