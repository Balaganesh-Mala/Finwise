const StudyMaterial = require('../models/StudyMaterial');
const Attendance = require('../models/Attendance'); // If we need to verify active status
const Student = require('../models/Student');
const axios = require('axios');

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

// @desc    Securely proxy PDF bytes for direct viewing, defeating CORS and Google Drive limits
// @route   GET /api/study-materials/proxy-pdf
// @access  Private
exports.proxyPdf = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

        let fetchUrl = url;

        // Transform Google Drive viewer URL into a raw download URL
        if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
            const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch) {
                const fileId = fileIdMatch[1];
                // If it's a document/spreadsheets/presentation, use the export format to get a PDF
                if (url.includes('/document/')) {
                    fetchUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
                } else if (url.includes('/presentation/')) {
                    fetchUrl = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
                } else if (url.includes('/spreadsheets/')) {
                    fetchUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
                } else {
                    fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                }
            }
        }

        // Fetch streaming response
        const fetchPdfStream = async (targetUrl, confirmToken = '') => {
            const finalUrl = confirmToken ? `${targetUrl}&confirm=${confirmToken}` : targetUrl;
            return await axios({
                method: 'get',
                url: finalUrl,
                responseType: 'stream',
                validateStatus: status => status >= 200 && status < 400
            });
        };

        let response = await fetchPdfStream(fetchUrl);

        // Google Drive Virus warning boundary check for large files
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html') || contentType.includes('text/plain')) {
            const chunks = [];
            for await (const chunk of response.data) {
                 chunks.push(chunk);
            }
            const htmlContent = Buffer.concat(chunks).toString('utf-8');
            const tokenMatch = htmlContent.match(/confirm=([a-zA-Z0-9_-]+)/);
            
            if (tokenMatch) {
                const confirmToken = tokenMatch[1];
                response = await fetchPdfStream(fetchUrl, confirmToken);
            }
            // If it's not a confirm token but still HTML, it might be a login requirement or error
            else if (contentType.includes('text/html')) {
                 return res.status(502).json({ success: false, message: 'Source document is not publicly accessible or requires bypass.' });
            }
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        res.setHeader('Access-Control-Allow-Origin', '*');

        response.data.pipe(res);

    } catch (error) {
        console.error('PDF Proxy error:', error.message);
        res.status(502).json({ success: false, message: 'Failed to securely fetch document' });
    }
};
