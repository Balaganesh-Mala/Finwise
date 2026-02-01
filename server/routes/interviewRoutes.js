const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');
const aiService = require('../services/aiService');

// Start Interview
router.post('/start', async (req, res) => {
  try {
    const { studentId, interviewType, mode } = req.body;
    
    // Generate first question
    const question = await aiService.generateQuestion(interviewType);

    // Create session (Draft)
    const session = new InterviewSession({
      studentId,
      interviewType,
      mode,
      questions: [{
        questionText: question.text,
        timestamp: new Date()
      }],
      status: 'in-progress'
    });

    await session.save();

    res.json({
      sessionId: session._id,
      question: question.text,
      audio: question.audio
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ message: 'Server error starting interview' });
  }
});

// Submit Answer & Evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Get the last question
    const currentQuestionIndex = session.questions.length - 1;
    const currentQuestion = session.questions[currentQuestionIndex];

    // Evaluate
    const evaluation = await aiService.evaluateAnswer(
      currentQuestion.questionText,
      answer,
      session.interviewType
    );

    // Update Session
    session.questions[currentQuestionIndex].studentAnswer = answer;
    session.questions[currentQuestionIndex].aiEvaluation = {
      communicationScore: evaluation.communicationScore,
      confidenceScore: evaluation.confidenceScore,
      technicalScore: evaluation.technicalScore,
      feedback: evaluation.feedback
    };

    await session.save();

    res.json(evaluation);

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ message: 'Server error evaluating answer' });
  }
});

// Get Next Question
router.post('/next', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const lastAnswer = session.questions[session.questions.length - 1]?.studentAnswer;

    // Get all previous question texts
    const previousQuestions = session.questions.map(q => q.questionText);

    // Generate next question
    const nextQ = await aiService.generateQuestion(session.interviewType, lastAnswer, previousQuestions);

    // Add to session
    session.questions.push({
      questionText: nextQ.text,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      question: nextQ.text,
      audio: nextQ.audio
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    res.status(500).json({ message: 'Server error generating question' });
  }
});

// End Interview & Save Final Report
router.post('/save', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Generate Final Report
    const report = await aiService.generateFinalReport(session);

    // Calculate Averages
    let totalComm = 0, totalConf = 0, totalTech = 0;
    const answeredQuestions = session.questions.filter(q => q.studentAnswer);
    const count = answeredQuestions.length;

    if (count > 0) {
        answeredQuestions.forEach(q => {
            totalComm += q.aiEvaluation?.communicationScore || 0;
            totalConf += q.aiEvaluation?.confidenceScore || 0;
            totalTech += q.aiEvaluation?.technicalScore || 0;
        });

        session.finalScore = {
            communication: Math.round(totalComm / count),
            confidence: Math.round(totalConf / count),
            technical: Math.round(totalTech / count),
            total: Math.round((totalComm + totalConf + totalTech) / (count * 3) * 10) // Scale to 10
        };
    } else {
         session.finalScore = { communication: 0, confidence: 0, technical: 0, total: 0 };
    }

    session.overallFeedback = report;
    session.status = 'completed';
    
    await session.save();

    res.json({
      success: true,
      finalScore: session.finalScore,
      feedback: session.overallFeedback
    });

  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ message: 'Server error saving session' });
  }
});

// Get History
router.get('/history/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`Fetching history for student: ${studentId}`);
    
    const history = await InterviewSession.find({ studentId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20);
      
    console.log(`Found ${history.length} completed sessions`);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// Get Single Session Details
router.get('/session/:sessionId', async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
