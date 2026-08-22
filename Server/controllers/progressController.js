const Answer = require('../models/Answer');
const Sentry = require('@sentry/node');

// @desc   Get aggregated progress/analytics for the logged-in user
// @route  GET /api/progress
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const allAnswers = await Answer.find({ user: userId });

    if (allAnswers.length === 0) {
      return res.status(200).json({
        totalQuestionsAttempted: 0,
        totalMockInterviews: 0,
        avgOverallScore: 0,
        topicBreakdown: []
      });
    }

    const totalQuestionsAttempted = allAnswers.length;

    const uniqueSessions = new Set(allAnswers.map((a) => a.sessionId));
    const totalMockInterviews = uniqueSessions.size;

    const avgOverallScore = (
      allAnswers.reduce((sum, a) => sum + a.score, 0) / totalQuestionsAttempted
    ).toFixed(1);

    const categoryMap = {};
    allAnswers.forEach((a) => {
      const cat = a.category || 'Technical';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalScore: 0, count: 0 };
      }
      categoryMap[cat].totalScore += a.score;
      categoryMap[cat].count += 1;
    });

    const topicBreakdown = Object.keys(categoryMap).map((topic) => {
      const { totalScore, count } = categoryMap[topic];
      const avgScore = Math.round((totalScore / count) * 10);
      let status = 'average';
      if (avgScore >= 70) status = 'strong';
      else if (avgScore < 40) status = 'weak';

      return {
        topic,
        avgScore,
        attempted: count,
        status
      };
    });

    res.status(200).json({
      totalQuestionsAttempted,
      totalMockInterviews,
      avgOverallScore: Number(avgOverallScore),
      topicBreakdown
    });

  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProgress };