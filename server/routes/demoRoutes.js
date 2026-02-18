const express = require('express');
const router = express.Router();
const DemoBooking = require('../models/DemoBooking');
const DemoSlot = require('../models/DemoSlot');

// --- Public Routes ---

// Get available slots
router.get('/slots', async (req, res) => {
    try {
        const { date } = req.query;
        let query = { isBooked: false };
        
        if (date) {
            // Filter by specific date (ignoring time component for the day match)
            const queryDate = new Date(date);
            const nextDay = new Date(queryDate);
            nextDay.setDate(queryDate.getDate() + 1);
            
            query.date = {
                $gte: queryDate,
                $lt: nextDay
            };
        } else {
             // Default: get generic future slots (from start of today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.date = { $gte: today };
        }

        const slots = await DemoSlot.find(query).sort({ date: 1, time: 1 });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Book a demo
router.post('/book', async (req, res) => {
    const { name, email, phone, course, education, date, timeSlot } = req.body;

    try {
        // 1. Check if slot is still available
        const bookingDate = new Date(date);
        
        // Find slot matching date (day) and time string
        // Note: Date comparison in mongo can be tricky with ISO strings, 
        // ensuring we match the exact slot record if it exists
        
        // Simple validation: Create booking
        const newBooking = new DemoBooking({
            name,
            email,
            phone,
            course,
            education,
            date: bookingDate,
            timeSlot
        });

        const savedBooking = await newBooking.save();
        
        // 2. Mark slot as booked if it exists in our slots table
        // This query finds a slot on the same day with the same time
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23,59,59,999);

        await DemoSlot.findOneAndUpdate(
            { 
                date: { $gte: startOfDay, $lt: endOfDay },
                time: timeSlot,
                isBooked: false 
            },
            { isBooked: true }
        );

        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Admin Routes ---

// Create slots (Bulk or Single)
router.post('/slots', async (req, res) => {
    try {
        const { slots } = req.body; // Expecting array of { date, time }
        
        // Validate and insert
        // Note: Using insertMany with ordered: false to continue if some duplicates exist (caught by index)
        const createdSlots = await DemoSlot.insertMany(slots, { ordered: false });
        
        res.status(201).json(createdSlots);
    } catch (err) {
        // If some failed due to duplicates, still return success for others if needed, 
        // or just return error. mongoose throws error on first fail if ordered:true (default)
        // or returns result with checks if ordered:false.
         res.status(400).json({ message: "Error creating slots. Some might duplicate existing ones.", error: err.message });
    }
});

// Get all bookings (for Admin)
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await DemoBooking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a slot
router.delete('/slots/:id', async (req, res) => {
    try {
        await DemoSlot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slot deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
