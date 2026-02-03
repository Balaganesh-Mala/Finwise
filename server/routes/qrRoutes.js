const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const StudentQR = require('../models/StudentQR');
const Student = require('../models/Student');
const TrainerQR = require('../models/TrainerQR');
const Trainer = require('../models/Trainer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Import Supabase Admin
const supabaseAdmin = require('../config/supabase');

// @route   POST /api/qr/generate/:studentId
// @desc    Generate or Regenerate QR Token for a student
// @access  Admin (or Student if allowed)
router.post('/generate/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Verify student exists locally
        let query = {};
        if (studentId.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = studentId;
        } else {
            query.supabaseId = studentId;
        }
        
        let student = await Student.findOne(query);

        // 2. If not found, try to sync from Supabase
        if (!student) {
             console.log(`Student not found locally. Attempting sync for ID: ${studentId}`);
             try {
                 const { data, error } = await supabaseAdmin.auth.admin.getUserById(studentId);
                 
                 if (error || !data.user) {
                     console.error("Supabase User Fetch Error:", error);
                     return res.status(404).json({ message: 'Student not found in Auth System' });
                 }

                 // Create local student record
                 student = await Student.create({
                     supabaseId: data.user.id,
                     email: data.user.email,
                     name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                     createdAt: new Date()
                 });

                 console.log("Synced Student Record:", student._id);

             } catch (syncErr) {
                 console.error("Sync Error:", syncErr);
                 return res.status(404).json({ message: 'Student not found and Sync failed' });
             }
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 2. Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenCreatedAt = new Date();

        // 3. Encode data for QR
        // "studentId={id}&token={secureToken}"
        // We use the mongo _id for stability
        const qrData = JSON.stringify({
            studentId: student._id.toString(),
            token: token
        });

        // 4. Generate QR Image (Base64)
        const qrImageBase64 = await QRCode.toDataURL(qrData);

        // 5. Upload to Cloudinary
        const result = await cloudinary.uploader.upload(qrImageBase64, {
            folder: 'student_qrs',
            public_id: `qr_${student._id}`,
            overwrite: true,
            resource_type: 'image'
        });

        // 6. Save/Update DB
        let studentQR = await StudentQR.findOne({ studentId: student._id });

        if (studentQR) {
            // Update
            studentQR.qrToken = token;
            studentQR.qrImageURL = result.secure_url;
            studentQR.tokenCreatedAt = tokenCreatedAt;
            studentQR.tokenExpiresAt = null; // Reset expiry if any
            await studentQR.save();
        } else {
            // Create
            studentQR = await StudentQR.create({
                studentId: student._id,
                qrToken: token,
                qrImageURL: result.secure_url,
                tokenCreatedAt: tokenCreatedAt
            });
        }

        res.json({
            success: true,
            qrImageURL: result.secure_url,
            token: token,
            message: 'QR Code generated successfully'
        });

    } catch (err) {
        console.error('QR Generation Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/qr/:studentId
// @desc    Get student QR data
// @access  Public (protected by client logic usually, or token)
router.get('/:studentId', async (req, res) => {
    try {
         const { studentId } = req.params;
         
         // 1. Verify student exists locally
         let query = {};
         if (studentId.match(/^[0-9a-fA-F]{24}$/)) {
             query._id = studentId;
         } else {
             query.supabaseId = studentId;
         }
         
         let student = await Student.findOne(query);

         if (!student) {
             console.log("Student not found for QR fetch:", studentId);
             // Return 404 but soft (maybe user hasn't been synced yet)
             return res.status(404).json({ message: 'Student not found' });
         }

         const studentQR = await StudentQR.findOne({ studentId: student._id });
         
         if (!studentQR) {
             return res.status(404).json({ message: 'QR Code not generated yet' });
         }

         res.json({
             qrImageURL: studentQR.qrImageURL,
             tokenCreatedAt: studentQR.tokenCreatedAt
         });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/qr/trainer/generate/:trainerId
// @desc    Generate or Regenerate QR Token for a trainer
// @access  Admin or Trainer
router.post('/trainer/generate/:trainerId', async (req, res) => {
    try {
        const { trainerId } = req.params;

        // 1. Verify trainer exists
        const trainer = await Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        // 2. Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenCreatedAt = new Date();

        // 3. Encode data for QR
        const qrData = JSON.stringify({
            trainerId: trainer._id.toString(),
            token: token
        });

        // 4. Generate QR Image (Base64)
        const qrImageBase64 = await QRCode.toDataURL(qrData);

        // 5. Upload to Cloudinary
        const result = await cloudinary.uploader.upload(qrImageBase64, {
            folder: 'trainer_qrs',
            public_id: `qr_trainer_${trainer._id}`,
            overwrite: true,
            resource_type: 'image'
        });

        // 6. Save/Update DB
        let trainerQR = await TrainerQR.findOne({ trainerId: trainer._id });

        if (trainerQR) {
            // Update
            trainerQR.qrToken = token;
            trainerQR.qrImageURL = result.secure_url;
            trainerQR.tokenCreatedAt = tokenCreatedAt;
            trainerQR.tokenExpiresAt = null; 
            await trainerQR.save();
        } else {
            // Create
            trainerQR = await TrainerQR.create({
                trainerId: trainer._id,
                qrToken: token,
                qrImageURL: result.secure_url,
                tokenCreatedAt: tokenCreatedAt
            });
        }

        res.json({
            success: true,
            qrImageURL: result.secure_url,
            token: token,
            message: 'QR Code generated successfully'
        });

    } catch (err) {
        console.error('Trainer QR Generation Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET /api/qr/trainer/:trainerId
// @desc    Get trainer QR data
// @access  Public (protected by client logic)
router.get('/trainer/:trainerId', async (req, res) => {
    try {
         const { trainerId } = req.params;
         
         const trainerQR = await TrainerQR.findOne({ trainerId: trainerId });
         
         if (!trainerQR) {
             return res.status(404).json({ message: 'QR Code not generated yet' });
         }

         res.json({
             qrImageURL: trainerQR.qrImageURL,
             tokenCreatedAt: trainerQR.tokenCreatedAt
         });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
