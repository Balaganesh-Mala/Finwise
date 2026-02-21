const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const BatchStudent = require('../models/BatchStudent');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @route   POST /api/batches
// @desc    Create a new batch
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { name, courseId, startDate, endDate, maxStudents, description } = req.body;

        if (!name || !courseId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Name, courseId, startDate, and endDate are required' });
        }

        // Verify the course exists
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const batch = new Batch({ name, courseId, startDate, endDate, maxStudents, description });
        await batch.save();

        res.status(201).json({ success: true, batch });
    } catch (err) {
        console.error('Create Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/batches
// @desc    List all batches with course info
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        const filter = courseId ? { courseId } : {};

        const batches = await Batch.find(filter)
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        // Attach student count to each batch
        const batchesWithCount = await Promise.all(
            batches.map(async (batch) => {
                const count = await BatchStudent.countDocuments({ batchId: batch._id });
                return { ...batch.toObject(), studentCount: count };
            })
        );

        res.json({ success: true, batches: batchesWithCount });
    } catch (err) {
        console.error('List Batches Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/batches/:id
// @desc    Get batch details
// @access  Admin
router.get('/:id', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id).populate('courseId', 'title duration');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        const studentCount = await BatchStudent.countDocuments({ batchId: batch._id });
        res.json({ success: true, batch: { ...batch.toObject(), studentCount } });
    } catch (err) {
        console.error('Get Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/batches/:id
// @desc    Update a batch
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { name, startDate, endDate, maxStudents, description, status } = req.body;

        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { name, startDate, endDate, maxStudents, description, status },
            { new: true, runValidators: true }
        ).populate('courseId', 'title');

        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        res.json({ success: true, batch });
    } catch (err) {
        console.error('Update Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/batches/:id
// @desc    Delete a batch
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        // Remove all student enrollments for this batch
        await BatchStudent.deleteMany({ batchId: batch._id });
        await batch.deleteOne();

        res.json({ success: true, message: 'Batch deleted' });
    } catch (err) {
        console.error('Delete Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/batches/:id/assign
// @desc    Assign a student to a batch
// @access  Admin
router.post('/:id/assign', async (req, res) => {
    try {
        const { studentId, enrollmentDate } = req.body;
        const batchId = req.params.id;

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Check capacity
        const currentCount = await BatchStudent.countDocuments({ batchId });
        if (currentCount >= batch.maxStudents) {
            return res.status(400).json({ message: 'Batch is full' });
        }

        // Upsert: if student is already in a batch for this course, update it
        const enrollment = await BatchStudent.findOneAndUpdate(
            { studentId, courseId: batch.courseId },
            {
                batchId,
                courseId: batch.courseId,
                enrollmentDate: enrollmentDate || new Date(),
                status: 'active'
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, enrollment });
    } catch (err) {
        console.error('Assign Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/batches/student/change-batch
// @desc    Move a student to a different batch
// @access  Admin
router.put('/student/change-batch', async (req, res) => {
    try {
        const { studentId, newBatchId } = req.body;

        const newBatch = await Batch.findById(newBatchId);
        if (!newBatch) return res.status(404).json({ message: 'Target batch not found' });

        const enrollment = await BatchStudent.findOneAndUpdate(
            { studentId, courseId: newBatch.courseId },
            { batchId: newBatchId, enrollmentDate: new Date() },
            { new: true }
        );

        if (!enrollment) {
            return res.status(404).json({ message: 'Student enrollment not found for this course' });
        }

        res.json({ success: true, enrollment });
    } catch (err) {
        console.error('Change Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/batches/:id/students
// @desc    List all students in a batch
// @access  Admin
router.get('/:id/students', async (req, res) => {
    try {
        const enrollments = await BatchStudent.find({ batchId: req.params.id })
            .populate('studentId', 'name email phone status courseName profilePicture')
            .sort({ enrollmentDate: -1 });

        res.json({ success: true, students: enrollments });
    } catch (err) {
        console.error('Batch Students Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/batches/student/:studentId/enrollment
// @desc    Get a student's current batch enrollment(s)
// @access  Admin/Student
router.get('/student/:studentId/enrollment', async (req, res) => {
    try {
        const enrollments = await BatchStudent.find({ studentId: req.params.studentId })
            .populate('batchId', 'name startDate endDate status')
            .populate('courseId', 'title');

        res.json({ success: true, enrollments });
    } catch (err) {
        console.error('Get Student Enrollment Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/batches/:id/students/:studentId
// @desc    Remove a student from a batch
// @access  Admin
router.delete('/:id/students/:studentId', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        await BatchStudent.findOneAndDelete({ batchId: req.params.id, studentId: req.params.studentId });
        res.json({ success: true, message: 'Student removed from batch' });
    } catch (err) {
        console.error('Remove Student from Batch Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
