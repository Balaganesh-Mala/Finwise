const MockInterviewSchedule = require('../models/MockInterviewSchedule');
const Student = require('../models/Student');
const BatchStudent = require('../models/BatchStudent');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const { sendEmail } = require('../utils/emailService');
const { interviewScheduleTemplate } = require('../templates/emailTemplates');
const { sendPushToStudent } = require('../services/pushService');
const mongoose = require('mongoose');

// @desc    Create individual interview or batch sequence
// @route   POST /api/admin/interviews/schedule
// @access  Admin
exports.createSchedules = async (req, res) => {
    try {
        const { 
            studentIds, 
            batchId, 
            interviewerId, 
            startDate, 
            startTime, 
            duration, 
            bufferTime, 
            meetingPlatform, 
            meetingLink, 
            meetingPasscode, 
            instructions, 
            requiredDocs 
        } = req.body;

        let selectedStudentIds = studentIds || [];

        // If batchId is provided, fetch all active students in that batch
        if (batchId) {
            const batchStudents = await BatchStudent.find({ batchId, status: 'active' }).select('studentId');
            selectedStudentIds = batchStudents.map(bs => bs.studentId);
        }

        if (selectedStudentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No students selected' });
        }

        // Fetch site settings for branding
        const settings = await Setting.findOne();

        const schedules = [];
        let currentStartTime = new Date(`${startDate} ${startTime}`);

        for (const studentId of selectedStudentIds) {
            const student = await Student.findById(studentId);
            if (!student) continue;

            const endTime = new Date(currentStartTime.getTime() + duration * 60000);

            const scheduleData = {
                studentId,
                interviewerId,
                batchId: batchId || null,
                date: new Date(startDate),
                startTime: currentStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration,
                meetingPlatform,
                meetingLink,
                meetingPasscode,
                instructions,
                requiredDocs,
                status: 'Scheduled'
            };

            const schedule = await MockInterviewSchedule.create(scheduleData);
            schedules.push(schedule);

            // 1. Send Immediate Email
            const emailSubject = `Scheduled: Your Mock Interview for ${new Date(startDate).toLocaleDateString()}`;
            const emailBody = interviewScheduleTemplate(student.name, {
                date: new Date(startDate).toLocaleDateString('en-GB'),
                time: `${schedule.startTime} - ${schedule.endTime}`,
                platform: meetingPlatform,
                link: meetingLink,
                passcode: meetingPasscode,
                instructions,
                requiredDocs
            }, settings);

            try {
                await sendEmail(student.email, emailSubject, emailBody);
            } catch (err) {
                console.error(`Failed to send schedule email to ${student.email}:`, err);
            }

            // 2. Create System Notification
            await Notification.create({
                recipient: studentId,
                recipientModel: 'Student',
                title: 'Mock Interview Scheduled',
                message: `You have an interview on ${new Date(startDate).toLocaleDateString()} at ${schedule.startTime}.`,
                type: 'alert',
                link: '/dashboard'
            });

            // 3. Send Browser Push (Instant Notification)
            await sendPushToStudent(studentId, {
                title: 'Mock Interview Scheduled!',
                body: `Scheduled for ${new Date(startDate).toLocaleDateString()} at ${schedule.startTime}`,
                url: '/dashboard'
            });

            // Calculate next start time for sequential scheduling
            currentStartTime = new Date(endTime.getTime() + bufferTime * 60000);
        }

        res.status(201).json({ success: true, count: schedules.length });

    } catch (error) {
        console.error('Error creating interview schedules:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all schedules with filters
// @route   GET /api/admin/interviews/schedules
exports.getSchedules = async (req, res) => {
    try {
        const { studentId, interviewerId, date, status } = req.query;
        let query = {};

        if (studentId) query.studentId = studentId;
        if (interviewerId) query.interviewerId = interviewerId;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        if (status) query.status = status;

        const schedules = await MockInterviewSchedule.find(query)
            .populate('studentId', 'name email profilePicture')
            .populate('interviewerId', 'name specialization photo')
            .sort({ date: 1, startTime: 1 })
            .lean();

        const enrichedSchedules = await Promise.all(schedules.map(async (item) => {
            if (item.studentId?._id) {
                // Find current active batch name for the student
                const batchAssignment = await BatchStudent.findOne({ 
                    studentId: item.studentId._id,
                    status: 'active'
                })
                .populate('batchId', 'name')
                .lean();
                
                item.studentId.batchName = batchAssignment?.batchId?.name || 'Unassigned';
            }
            return item;
        }));

        res.json({ success: true, count: enrichedSchedules.length, data: enrichedSchedules });
    } catch (error) {
        console.error('Error fetching interview schedules:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update schedule status
// @route   PATCH /api/admin/interviews/schedules/:id
exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await MockInterviewSchedule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Error updating interview schedule:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete schedule
// @route   DELETE /api/admin/interviews/schedules/:id
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await MockInterviewSchedule.findByIdAndDelete(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting interview schedule:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
