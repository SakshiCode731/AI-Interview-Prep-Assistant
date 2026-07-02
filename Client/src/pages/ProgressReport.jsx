import { useNavigate } from 'react-router-dom';

const ProgressReport = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Readiness score', value: '70%', sub: '+5% this week', subColor: 'text-green-400' },
    { label: 'Questions practiced', value: '24', sub: '+3 today', subColor: 'text-green-400' },
    { label: 'Avg answer score', value: '7.8/10', sub: 'Good performance', subColor: 'text-yellow-400' },
    { label: 'Companies saved', value: '5', sub: '2 upcoming drives', subColor: 'text-purple-400' },
  ];

  const skills = [
    { name: 'DSA', pct: 42, color: 'bg-red-500' },
    { name: 'React', pct: 82, color: 'bg-green-500' },
    { name: 'Node.js', pct: 76, color: 'bg-green-400' },
    { name: 'System Design', pct: 28, color: 'bg-red-500' },
    { name: 'SQL', pct: 58, color: 'bg-yellow-400' },
    { name: 'Communication', pct: 70, color: 'bg-blue-400' },
  ];

  const readinessBreakdown = [
    { label: 'Skills match', pct: 75, color: 'bg-blue-400' },
    { label: 'Experience', pct: 40, color: 'bg-yellow-400' },
    { label: 'Projects', pct: 80, color: 'bg-green-400' },
    { label: 'Resume quality', pct: 65, color: 'bg-blue-300' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-white">PrepAI</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">📈 Progress Report</h2>
        <p className="text-gray-400 mb-8">Track your interview readiness journey</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-2">{s.label}</p>
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className={`text-sm ${s.subColor}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Skill Gap */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-5">🎯 Skill gap analysis</h3>
            <div className="space-y-4">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-28 flex-shrink-0">{s.name}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                    <div className={`${s.color} h-2.5 rounded-full`} style={{ width: `${s.pct}%` }}></div>
                  </div>
                  <span className="text-gray-400 text-sm w-10 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-5">🎯 Readiness breakdown</h3>
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray="70 30" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">70</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {readinessBreakdown.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${r.color}`}></div>
                    <span className="text-gray-400 text-sm">{r.label}</span>
                  </div>
                  <span className="text-white text-sm">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProgressReport;