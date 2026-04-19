const StudyMaterial = require('../models/StudyMaterial');
const Attendance = require('../models/Attendance'); // If we need to verify active status
const Student = require('../models/Student');

// @desc    Create new study material
// @route   POST /api/study-materials
// @access  Private (Admin)
exports.createMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.create({
            ...req.body,
            uploadedBy: req.user ? req.user._id : null
        });
        res.status(201).json({ success: true, data: material });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all materials (Admin view)
// @route   GET /api/study-materials
// @access  Private (Admin)
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.find()
            .populate('targetBatches', 'name')
            .populate('targetStudents', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: materials.length, data: materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete material
// @route   DELETE /api/study-materials/:id
// @access  Private (Admin)
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }
        await material.deleteOne();
        res.status(200).json({ success: true, message: 'Material removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get materials for a specific student (Student Portal)
// @route   GET /api/study-materials/student/:studentId
// @access  Private (Student)
exports.getStudentMaterials = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Find the student to get their batch ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Logic: Find materials that are:
        // 1. targetType: global
        // 2. targetType: batch AND student's batch is in targetBatches
        // 3. targetType: individual AND student's ID is in targetStudents
        
        const query = {
            $or: [
                { targetType: 'global' },
                { 
                    targetType: 'batch', 
                    targetBatches: student.batchId 
                },
                { 
                    targetType: 'individual', 
                    targetStudents: studentId 
                }
            ]
        };

        const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: materials.length, data: materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
