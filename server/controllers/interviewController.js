const QuestionBank = require('../models/QuestionBank');
const StudentMCQAttempt = require('../models/StudentMCQAttempt');
const HiringTest = require('../models/HiringTest');

exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (search) query.question = { $regex: search, $options: 'i' };

    const questions = await QuestionBank.find(query).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk Insert
      const questionsData = req.body.map(q => ({
        ...q,
        type: q.type || 'MCQ', // Default to MCQ if not provided in JSON
        difficulty: q.difficulty || 'Moderate'
      }));
      const inserted = await QuestionBank.insertMany(questionsData);
      return res.status(201).json({ message: `${inserted.length} questions added successfully!`, count: inserted.length });
    } else {
      // Single Insert
      const newQuestion = new QuestionBank(req.body);
      await newQuestion.save();
      return res.status(201).json({ message: 'Question added successfully', question: newQuestion });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating question(s)', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await QuestionBank.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

// Analytics 
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const results = await StudentMCQAttempt.find()
      .populate('studentId', 'name')
      .populate('testId', 'title category');
    
    let totalTests = results.length;
    let avgScore = 0;
    let totalAccuracy = 0;
    
    // Calculate CA Readiness Score (Simple formula for demo: based on average score and accuracy weighted)
    
    const subjectStats = {};
    const monthlyStats = {};
    
    if (totalTests > 0) {
      let scoreSum = 0;
      let accuracySum = 0;
      
      results.forEach(r => {
        const accuracy = r.total > 0 ? (r.score / r.total) * 100 : 0;
        const subject = r.testId?.title || 'General Quiz';

        scoreSum += accuracy; // Assuming score/total percentage is the "score"
        accuracySum += accuracy;
        
        // Subject breakdown
        if (!subjectStats[subject]) {
          subjectStats[subject] = { totalScore: 0, count: 0 };
        }
        subjectStats[subject].totalScore += accuracy;
        subjectStats[subject].count += 1;
        
        // Monthly breakdown
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date(r.attemptedAt);
        const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        
        if (!monthlyStats[monthKey]) {
           monthlyStats[monthKey] = { sum: 0, count: 0 };
        }
        monthlyStats[monthKey].sum += accuracy;
        monthlyStats[monthKey].count += 1;
      });
      
      avgScore = scoreSum / totalTests;
      totalAccuracy = accuracySum / totalTests;
    }
    
    // Average scores per subject
    const subjectAverages = Object.keys(subjectStats).map(sub => ({
       name: sub,
       score: Math.round(subjectStats[sub].totalScore / subjectStats[sub].count)
    }));
    
    // CA Readiness (Arbitrary weighting: 60% avgScore, 40% accuracy - just an example)
    const caReadiness = totalTests > 0 ? (avgScore * 0.6) + (totalAccuracy * 0.4) : 0;
    
    // Best Subject
    let bestSubject = 'N/A';
    if (subjectAverages.length > 0) {
       bestSubject = subjectAverages.reduce((max, obj) => (obj.score > max.score ? obj : max), subjectAverages[0]).name;
    }
    
    const monthlyTrend = Object.keys(monthlyStats).map(key => ({
      month: key,
      score: Math.round(monthlyStats[key].sum / monthlyStats[key].count)
    }));

    // Format recent tests to match frontend expectations
    const formattedRecentTests = results.map(r => ({
        _id: r._id,
        subject: r.testId?.title || 'General Quiz',
        score: r.score,
        total_score: r.total,
        accuracy: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0,
        date: r.attemptedAt
    }));

    res.status(200).json({
      summary: {
         totalTestsTaken: totalTests,
         averageScore: Math.round(avgScore),
         caReadinessScore: Math.round(caReadiness),
         strongestSubject: bestSubject,
         averageAccuracy: Math.round(totalAccuracy)
      },
      charts: {
         subjectwise: subjectAverages,
         monthlyTrend: monthlyTrend
      },
      recentTests: formattedRecentTests.slice(-5).reverse() // Last 5 tests chronologically reverse
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
