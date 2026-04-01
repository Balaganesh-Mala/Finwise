const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Course = require('../models/Course');
const { sendEmail } = require('../utils/emailService');
const { brochureDownloadTemplate, syllabusDownloadTemplate, feeAndCurriculumTemplate } = require('../templates/emailTemplates');

// @route   POST /api/inquiries
// @desc    Create a new inquiry
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, courseInterested, message, source, courseId } = req.body;

        const newInquiry = new Inquiry({
            name,
            email,
            phone,
            courseInterested,
            message,
            source: source || 'contact_form'
        });

        const inquiry = await newInquiry.save();

        if (courseId && process.env.MAIL_SENDER_EMAIL) {
            try {
                const course = await Course.findById(courseId);
                if (course) {
                    if (source === 'brochure_download' && course.brochurePdf && course.brochurePdf.url) {
                        const htmlContent = brochureDownloadTemplate(name, course.title, course.brochurePdf.url);
                        await sendEmail(email, `Your Course Brochure: ${course.title} - Finwise`, htmlContent);
                    } else if (source === 'syllabus_download' && course.syllabusPdf && course.syllabusPdf.url) {
                        const htmlContent = syllabusDownloadTemplate(name, course.title, course.syllabusPdf.url);
                        await sendEmail(email, `Your Course Syllabus: ${course.title} - Finwise`, htmlContent);
                    } else if (source === 'quote_popup' && course.syllabusPdf && course.syllabusPdf.url) {
                        // Quote popup is for "Get Fee & Curriculum"
                        const htmlContent = feeAndCurriculumTemplate(name, course.title, course.fee, course.syllabusPdf.url);
                        await sendEmail(email, `Fee & Curriculum Details: ${course.title} - Finwise`, htmlContent);
                    }
                }
            } catch (emailErr) {
                console.error("Failed to send inquiry response email:", emailErr);
            }
        }

        res.status(201).json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Public (Should be Admin only)
router.get('/', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/inquiries/:id
// @desc    Delete an inquiry
// @access  Public (Should be Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }

        await inquiry.deleteOne();
        res.json({ msg: 'Inquiry removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/inquiries/:id
// @desc    Update inquiry status
// @access  Public (Should be Admin only)
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found' });
        }

        inquiry.status = status;
        await inquiry.save();

        res.json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
