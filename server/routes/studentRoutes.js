const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// @route   POST /api/students/invite
// @desc    Invite a new student (sends reset password email)
// @access  Admin (Protected)
router.post('/invite', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        console.log(`Inviting student: ${email}`);
        
        // 1. Invite User via Supabase Admin
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { 
                full_name: name,
                role: 'student' // custom claim
            },
            // Redirect URL after they set password (to login page)
            // Redirect URL after they set password
            // Make sure to add this URL to Supabase -> Authentication -> URL Configuration -> Redirect URLs
            redirectTo: `${process.env.CLIENT_URL}/student/login` 
        });

        if (error) {
            console.error('Supabase Invite Error:', error);
            return res.status(400).json({ message: error.message });
        }

        console.log('Invite sent successfully:', data);

        // Optional: Save to local MongoDB 'Student' collection if you want to sync data
        // await Student.create({ email, name, supabaseId: data.user.id });

        res.status(200).json({ 
            message: `Invitation email sent to ${email}`, 
            user: data.user 
        });

    } catch (err) {
        console.error('Server Invite Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
