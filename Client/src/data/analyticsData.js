export const analyticsData = {
  totalQuestionsAttempted: 24,
  totalMockInterviews: 4,
  avgOverallScore: 7.8,

  topicBreakdown: [
    { topic: 'DSA', avgScore: 42, attempted: 8, status: 'weak' },
    { topic: 'React', avgScore: 82, attempted: 6, status: 'strong' },
    { topic: 'Node.js', avgScore: 76, attempted: 5, status: 'strong' },
    { topic: 'System Design', avgScore: 28, attempted: 3, status: 'weak' },
    { topic: 'SQL', avgScore: 58, attempted: 4, status: 'average' },
    { topic: 'Communication', avgScore: 70, attempted: 6, status: 'average' },
  ],
};

// Returns the topic with the lowest avgScore
export const getWeakestArea = (data) => {
  return data.topicBreakdown.reduce((weakest, current) =>
    current.avgScore < weakest.avgScore ? current : weakest
  );
};

// Returns the topic with the highest avgScore
export const getStrongestArea = (data) => {
  return data.topicBreakdown.reduce((strongest, current) =>
    current.avgScore > strongest.avgScore ? current : strongest
  );
};