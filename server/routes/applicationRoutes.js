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
                resource_type: 'raw', // Go back to raw, we will handle access via signing
                use_filename: true,
                unique_filename: true,
                format: 'pdf' 
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

// @desc    Preview Resume Proxy (Streams PDF to bypass CORS/Raw issues)
// @route   GET /api/applications/:id/preview
// @access  Private (Admin)
router.get('/:id/preview', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.resumeUrl) {
            return res.status(404).json({ msg: 'File not found' });
        }

        // Generate a SIGNED URL to fetch the private raw file
        // For 'raw' resources, we construct the signed URL manually or use utils
        // Actually, if it's 'upload' type (public) but raw, strange it gave 401. 
        // Assuming it's effectively restricted. 
        // Let's use cloudinary.url with sign_url: true based on public_id.
        
        let fetchUrl = application.resumeUrl;
        
        if (application.resumePublicId) {
             fetchUrl = cloudinary.url(application.resumePublicId, {
                resource_type: 'raw',
                type: 'upload', // or 'authenticated' if it was uploaded as such, but default is upload
                sign_url: true, // IMPORTANT: Sign the URL to allow server to fetch it
                secure: true,
                format: 'pdf'
             });
        }

        console.log('Proxying Signed URL:', fetchUrl);

        // Fetch the file from Cloudinary as a stream
        const response = await axios({
            url: fetchUrl,
            method: 'GET',
            responseType: 'stream'
        });

        // Set headers to force PDF preview
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');

        // Pipe the Cloudinary stream to the Response
        response.data.pipe(res);

    } catch (err) {
        console.error('Preview Proxy Error:', err.message);
        if (err.response) {
            // console.error('Proxy Upstream Status:', err.response.status); 
        }
        res.status(500).json({ msg: 'Failed to fuzzy stream PDF' });
    }
});

// @desc    Submit new application with resume (Server-Side Upload)
// @route   POST /api/applications
// @access  Public
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No resume file uploaded' });
        }

        // 🔐 EXTRA SAFETY: Allow ONLY PDF as per user request
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ msg: 'Only PDF files are allowed' });
        }

        console.log('File received:', req.file.originalname, 'Size:', req.file.size);

        // Upload to Cloudinary using Stream
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);

        console.log('Cloudinary Upload Result:', result);

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

// @desc    Preview Resume Proxy (Returns Secure URL)
// @route   GET /api/applications/:id/preview
// @access  Private (Admin)
router.get('/:id/preview', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !application.resumeUrl) {
            return res.status(404).json({ msg: 'File not found' });
        }

        let fetchUrl = application.resumeUrl;
        
        if (application.resumePublicId) {
             // We need to guess the resource type. If the URL contains '/raw/', it's raw.
             const resourceType = application.resumeUrl.includes('/raw/') ? 'raw' : 'image';
             
             // Use private_download_url to generate a properly signed URL for raw/restricted files
             fetchUrl = cloudinary.utils.private_download_url(application.resumePublicId, 'pdf', {
                resource_type: resourceType,
                type: 'upload', 
                attachment: false
             });
        }

        console.log('Returning Signed URL:', fetchUrl);
        // Direct Return of Signed URL (Cleaner/Faster than proxying)
        // Cloudinary handles auth via signature and sets Content-Type: application/pdf
        res.json({ url: fetchUrl });

    } catch (err) {
        console.error('Preview Proxy Error:', err.message);
        res.status(500).json({ msg: 'Failed to generate preview URL' });
    }
});

module.exports = router;
