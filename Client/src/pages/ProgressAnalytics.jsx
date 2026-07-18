import { useNavigate } from 'react-router-dom';
import { analyticsData, getWeakestArea, getStrongestArea } from '../data/analyticsData';

const statusColor = {
  strong: { bar: 'bg-green-500', text: 'text-green-400', badge: 'bg-green-900/40 text-green-400' },
  average: { bar: 'bg-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-900/40 text-yellow-400' },
  weak: { bar: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-900/40 text-red-400' },
};

export default function ProgressAnalytics() {
  const navigate = useNavigate();
  const weakest = getWeakestArea(analyticsData);
  const strongest = getStrongestArea(analyticsData);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Progress Analytics</h1>
          <p className="text-gray-400 text-sm">Data-driven breakdown of your interview prep performance</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-500 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-2">Total questions attempted</p>
          <p className="text-3xl font-bold">{analyticsData.totalQuestionsAttempted}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-2">Mock interviews completed</p>
          <p className="text-3xl font-bold">{analyticsData.totalMockInterviews}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-2">Average overall score</p>
          <p className="text-3xl font-bold">{analyticsData.avgOverallScore}/10</p>
        </div>
      </div>

      {/* Weak / Strong highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-1">⚠️ Weakest area</p>
          <p className="text-xl font-bold text-red-400">{weakest.topic}</p>
          <p className="text-gray-400 text-sm mt-1">
            Avg score: <span className="text-red-400 font-semibold">{weakest.avgScore}%</span> across {weakest.attempted} questions
          </p>
        </div>
        <div className="bg-gray-900 border border-green-900/50 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-1">💪 Strongest area</p>
          <p className="text-xl font-bold text-green-400">{strongest.topic}</p>
          <p className="text-gray-400 text-sm mt-1">
            Avg score: <span className="text-green-400 font-semibold">{strongest.avgScore}%</span> across {strongest.attempted} questions
          </p>
        </div>
      </div>

      {/* Topic-wise breakdown table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Topic-wise performance</h3>
        <div className="space-y-3">
          {analyticsData.topicBreakdown
            .slice()
            .sort((a, b) => b.avgScore - a.avgScore)
            .map((t, i) => {
              const c = statusColor[t.status];
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-32 flex-shrink-0">{t.topic}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div className={`${c.bar} h-2 rounded-full`} style={{ width: `${t.avgScore}%` }}></div>
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right">{t.avgScore}%</span>
                  <span className="text-gray-500 text-xs w-20 text-right">{t.attempted} qs</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} capitalize w-16 text-center`}>
                    {t.status}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Suggestion box */}
      <div className="mt-6 bg-purple-900/20 border border-purple-800/50 rounded-2xl p-5">
        <p className="text-purple-300 font-semibold mb-1">📌 Recommended next step</p>
        <p className="text-gray-300 text-sm">
          Focus on <span className="text-red-400 font-semibold">{weakest.topic}</span> — your current average is{" "}
          {weakest.avgScore}%, well below your other topics. Try 5 more practice questions this week to close the gap.
        </p>
      </div>
    </div>
  );
}