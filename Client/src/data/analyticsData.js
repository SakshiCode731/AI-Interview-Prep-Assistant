export const analyticsData = {
  readinessScore: 70,
  readinessChange: 5,
  questionsPracticed: 24,
  questionsChangeToday: 3,
  avgAnswerScore: 7.8,
  companiesSaved: 5,
  upcomingDrives: 2,

  skills: [
    { name: 'DSA', score: 42, color: 'bg-red-500' },
    { name: 'React', score: 82, color: 'bg-green-500' },
    { name: 'Node.js', score: 76, color: 'bg-green-400' },
    { name: 'System Design', score: 28, color: 'bg-red-500' },
    { name: 'SQL', score: 58, color: 'bg-yellow-400' },
    { name: 'Communication', score: 70, color: 'bg-blue-400' },
  ],

  readinessBreakdown: [
    { label: 'Skills match', pct: 75, color: 'bg-blue-400' },
    { label: 'Experience', pct: 40, color: 'bg-yellow-400' },
    { label: 'Projects', pct: 80, color: 'bg-green-400' },
    { label: 'Resume quality', pct: 65, color: 'bg-blue-300' },
  ],

  weeklyProgress: [
    { week: 'Week 1', score: 50 },
    { week: 'Week 2', score: 58 },
    { week: 'Week 3', score: 64 },
    { week: 'Week 4', score: 70 },
  ],
};

// Returns the skill with the lowest score
export const getWeakestArea = () => {
  return analyticsData.skills.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest
  );
};

// Returns the skill with the highest score
export const getStrongestArea = () => {
  return analyticsData.skills.reduce((strongest, current) =>
    current.score > strongest.score ? current : strongest
  );
};