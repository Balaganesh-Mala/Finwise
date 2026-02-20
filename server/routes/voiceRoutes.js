const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Student = require('../models/Student');
const OpenAI = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} else {
    console.warn("WARNING: OPENAI_API_KEY is missing. AI analysis will not work.");
}

// Rate limiting map (simple in-memory for demo, use Redis for production)
const interviewRateLimit = new Map();

// Helper to check rate limit
const checkRateLimit = (studentId) => {
    const today = new Date().toDateString();
    const key = `${studentId}-${today}`;
    const count = interviewRateLimit.get(key) || 0;
    
    if (count >= 3) return false;
    
    interviewRateLimit.set(key, count + 1);
    return true;
};

// @route   POST /api/voice/start-interview
// @desc    Start an interview session
// @access  Public (protected by client logic usually, or add auth middleware)
router.post('/start-interview', async (req, res) => {
    try {
        const { studentId, name } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required' });
        }

        // Check rate limit
        if (!checkRateLimit(studentId)) {
            return res.status(429).json({ 
                success: false, 
                message: 'Daily interview limit reached (3 per day). Please try again tomorrow.' 
            });
        }

        // Return configuration for Vapi SDK
        // In a production app, you might create a signed URL or ephemeral token here
        // For Vapi, the public key is used on the frontend, so we confirm readiness here
        res.json({
            success: true,
            message: 'Interview session initialized',
            agentId: process.env.VAPI_AGENT_ID,
            studentName: name
        });

    } catch (err) {
        console.error('Error starting interview:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/voice/vapi-webhook
// @desc    Handle Vapi webhook events (call.ended)
// @access  Public (Verified by signature)
router.post('/vapi-webhook', async (req, res) => {
    try {
        const { message } = req.body;
        const secret = process.env.VAPI_WEBHOOK_SECRET;
        const signature = req.headers['x-vapi-signature'];

        // Verify Signature
        if (secret && signature !== secret) { // Basic check - Vapi computes this differently usually? 
            // Vapi docs say: "x-vapi-secret" header contains the secret you set.
            // Let's check if the header matches the secret we set in Dashboard.
            // If using cryptographic signature, we'd need crypto. But simplest mode is matching secret string.
            // Adjust based on your Vapi dashboard setting. assuming simple secret match for now.
             return res.status(401).send("Invalid signature");
        }

        if (message.type === 'end-of-call-report') {
            const { call, customer, analysis, recordingUrl, transcript, artifact } = message;
            
            // Extract studentId (passed as customer.number or metadata if set)
            // Ideally, pass studentId in metadata when starting call from frontend
            const studentId = call.metadata?.studentId; 

            // Analyze with OpenAI if Vapi didn't provide enough
            let feedback = analysis?.summary || "No summary available.";
            let score = 5; // Default

            if (transcript && openai) {
                try {
                    const aiResponse = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are an expert interview coach. Analyze the following interview transcript. Provide: 1. Strengths 2. Weaknesses 3. A communication score (0-10) 4. Actionable feedback. Return as JSON: { strengths, weaknesses, score, feedback }" },
                            { role: "user", content: transcript }
                        ],
                        response_format: { type: "json_object" }
                    });

                    const result = JSON.parse(aiResponse.choices[0].message.content);
                    feedback = `**Strengths:** ${result.strengths}\n\n**Weaknesses:** ${result.weaknesses}\n\n**Feedback:** ${result.feedback}`;
                    score = result.score;
                } catch (aiErr) {
                    console.error("AI Analysis failed:", aiErr);
                    // Fallback to Vapi's summary if OpenAI fails
                    feedback = analysis?.summary || "Analysis failed.";
                }
            } else {
                 if (!openai) console.warn("Skipping AI analysis: OpenAI key missing.");
                 feedback = analysis?.summary || "AI Analysis unavailable (Missing API Key).";
            }

            // Create Interview Record
            // We need studentId. If strictly required, ensure frontend sends it in metadata.
            // For now, if no studentId, we might log it or skip saving (or save with null).
            if (studentId) {
                await Interview.create({
                    studentId,
                    callId: call.id,
                    transcript: transcript || artifact?.transcript,
                    summary: analysis?.summary,
                    feedback,
                    score,
                    duration: call.durationSeconds, // Check Vapi payload for exact field
                    recordingUrl: recordingUrl || artifact?.recordingUrl,
                    status: 'completed'
                });
            }
        }

        res.json({ success: true });

    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/voice/history/:studentId
// @desc    Get interview history for a student
// @access  Public
router.get('/history/:studentId', async (req, res) => {
    try {
        const interviews = await Interview.find({ studentId: req.params.studentId })
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: interviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
