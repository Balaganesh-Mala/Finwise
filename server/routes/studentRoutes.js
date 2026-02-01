const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Setting = require('../models/Setting'); // Import Settings Model
const { sendEmail } = require('../utils/emailService');
const { studentRegistrationTemplate } = require('../templates/emailTemplates');

// ... (other routes)

// @route   POST /api/students/create
// @desc    Create a new student, generate password, and send email
// @access  Admin
router.post('/create', async (req, res) => {
    try {
        const { 
            name, email, phone, gender, dob, address, city, 
            courseName, courseCategory, batchTiming, startDate, 
            access 
        } = req.body;

        // Check if student exists
        let student = await Student.findOne({ email });
        if (student) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        // Generate Password: name + 4 random digits
        const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const plainPassword = `${firstName}${randomDigits}`;

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        // Create Student
        student = new Student({
            name,
            email,
            phone,
            gender,
            dob,
            address,
            city,
            courseName,
            courseCategory,
            batchTiming,
            startDate,
            access, // Object containing boolean flags
            passwordHash,
            status: 'Active'
        });

        await student.save();
        console.log(`Student created: ${student.email}`);

        // Fetch Global Settings for Branding
        let settings = {};
        try {
            settings = await Setting.findOne() || {};
            console.log('Settings fetched for email branding');
        } catch (settingErr) {
            console.error('Error fetching settings (using defaults):', settingErr);
        }

        // Send Email with Dynamic Branding
        try {
            console.log(`Attempting to send registration email to ${email}...`);
            await sendEmail(
                email,
                `Welcome to ${settings.siteTitle || 'Wonew Skill Up Academy'} - Student Portal Login`,
                studentRegistrationTemplate(name, email, plainPassword, settings)
            );
            console.log('Registration email sent successfully.');
        } catch (emailErr) {
            console.error('FAILED to send registration email:', emailErr);
            // We don't block the response, but we log the error
        }

        res.status(201).json({ 
            success: true, 
            message: 'Student created (Email attempt finished)', 
            student: { ...student._doc, passwordHash: undefined } 
        });

    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/students/list
// @desc    Get all students
// @access  Admin
router.get('/list', async (req, res) => {
    try {
        const students = await Student.find()
            .select('-passwordHash') // Exclude password
            .sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Admin/Student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-passwordHash');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/students/update/:id
// @desc    Update student details
// @access  Admin
router.put('/update/:id', async (req, res) => {
    try {
        const { 
            name, phone, gender, dob, address, city, 
            courseName, courseCategory, batchTiming, startDate, 
            access, status 
        } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Update fields
        student.name = name || student.name;
        student.phone = phone || student.phone;
        student.gender = gender || student.gender;
        student.dob = dob || student.dob;
        student.address = address || student.address;
        student.city = city || student.city;
        
        student.courseName = courseName || student.courseName;
        student.courseCategory = courseCategory || student.courseCategory;
        student.batchTiming = batchTiming || student.batchTiming;
        student.startDate = startDate || student.startDate;
        
        if (access) student.access = access;
        if (status) student.status = status;

        // Password Update Logic
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            student.passwordHash = await bcrypt.hash(req.body.password, salt);
        }

        student.updatedAt = Date.now();
        await student.save();

        res.json({ 
            success: true, 
            message: 'Student updated successfully', 
            student: { ...student._doc, passwordHash: undefined } 
        });

    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await student.deleteOne();
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
