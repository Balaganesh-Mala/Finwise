const express = require('express');
const router = express.Router();
const HiringTest = require('../models/HiringTest');
const auth = require('../middleware/authMiddleware');

// Create a new Test
router.post('/create', async (req, res) => {
    try {
        const { title, type, questions, instructions, prompt } = req.body;
        
        const newTest = new HiringTest({
            title,
            type,
            questions: type === 'mcq' ? questions : [],
            instructions,
            prompt
        });

        await newTest.save();
        res.status(201).json({ message: 'Test created successfully', test: newTest });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tests (optional filter by type)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const tests = await HiringTest.find(query).sort({ createdAt: -1 });
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a test
router.put('/:id', async (req, res) => {
    try {
        const { title, type, questions, instructions, prompt } = req.body;
        
        const updatedTest = await HiringTest.findByIdAndUpdate(
            req.params.id,
            {
                title,
                type,
                questions: type === 'mcq' ? questions : [],
                instructions,
                prompt
            },
            { new: true }
        );

        if (!updatedTest) return res.status(404).json({ message: 'Test not found' });

        res.json({ message: 'Test updated successfully', test: updatedTest });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a test
router.delete('/:id', async (req, res) => {
    try {
        await HiringTest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
