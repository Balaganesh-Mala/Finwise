const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', // Admin Panel
        'http://localhost:5175', // Potential Student Port
        'http://localhost:5176',
        'http://localhost:5000',
        'http://wonew.in', // Also allow HTTP
        'http://student.wonew.in',
        'http://admin.wonew.in',
        'https://wonew.in', // Production HTTPS
        'https://student.wonew.in',
        'https://admin.wonew.in',
        'https://jobready-client.onrender.com',
        'https://jobready-q89p.onrender.com', // Student Portal Deployed
        process.env.CLIENT_URL,
        process.env.ADMIN_URL
    ],
    credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/run', require('./routes/runRoutes'));
app.use('/api/code', require('./routes/codeRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/typing', require('./routes/typingRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Test Email Route
app.get('/api/test/email', async (req, res) => {
    try {
        const { sendEmail } = require('./utils/emailService');
        await sendEmail(
            process.env.MAIL_SENDER_EMAIL || 'info@wonew.in',
            'Test Email from Wonew (Hostinger)',
            '<h1>It Works!</h1><p>Hostinger SMTP is connected via Nodemailer.</p>'
        );
        res.json({ success: true, message: 'Test email sent!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('JobReady Skills Center API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
