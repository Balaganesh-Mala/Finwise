const Module = require('../models/Module');
const Topic = require('../models/Topic');

// @desc    Create a new module
// @route   POST /api/admin/module/create
// @access  Admin
exports.createModule = async (req, res) => {
    try {
        const { courseId, title, order } = req.body;

        if (!courseId || !title || order === undefined) {
            return res.status(400).json({ message: 'Please provide courseId, title and order' });
        }

        const module = await Module.create({
            courseId,
            title,
            order
        });

        res.status(201).json({ success: true, module });
    } catch (err) {
        console.error('Error creating module:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get all modules for a course
// @route   GET /api/admin/modules/:courseId
// @access  Public (Student needs to see them too)
exports.getModulesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log(`[API] Fetching modules for CourseID: ${courseId}`);
        
        const modules = await Module.find({ courseId }).sort({ order: 1 });
        console.log(`[API] Found ${modules.length} modules`);
        
        res.json({ success: true, count: modules.length, modules });
    } catch (err) {
        console.error('Error fetching modules:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Update a module
// @route   PUT /api/admin/module/:id
// @access  Admin
exports.updateModule = async (req, res) => {
    try {
        const { title, order } = req.body;
        
        let module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        module.title = title || module.title;
        if (order !== undefined) module.order = order;

        await module.save();

        res.json({ success: true, module });
    } catch (err) {
        console.error('Error updating module:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Delete a module
// @route   DELETE /api/admin/module/:id
// @access  Admin
exports.deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Optional: Delete associated topics
        await Topic.deleteMany({ moduleId: module._id });

        await module.deleteOne();

        res.json({ success: true, message: 'Module and associated topics deleted' });
    } catch (err) {
        console.error('Error deleting module:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
