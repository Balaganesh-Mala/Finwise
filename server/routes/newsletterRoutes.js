const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Please provide an email' });
        }

        // Check if already subscribed
        let subscriber = await Newsletter.findOne({ email });
        if (subscriber) {
            return res.status(400).json({ msg: 'Email is already subscribed' });
        }

        subscriber = new Newsletter({ email });
        await subscriber.save();

        res.status(201).json({ msg: 'Successfully subscribed to our newsletter!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
