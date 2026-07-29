import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import API from '../services/api';

const statusToColor = {
  strong: 'bg-green-500',
  average: 'bg-yellow-400',
  weak: 'bg-red-500',
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [readiness, setReadiness] = useState(null); // { analyzed, data }
  const [readinessLoading, setReadinessLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get('/progress');
        setProgress(res.data);
      } catch (err) {
        setProgress(null);
      } finally {
        setProgressLoading(false);
      }
    };

    const fetchReadiness = async () => {
      try {
        const res = await API.get('/readiness/me');
        setReadiness(res.data);
      } catch (err) {
        setReadiness(null);
      } finally {
        setReadinessLoading(false);
      }
    };

    fetchProgress();
    fetchReadiness();
  }, []);

  // Notifications: no real notification system exists yet (would need a
  // Notification model + endpoint triggered from mock interview / answer
  // evaluator / readiness events). Kept empty rather than showing fake ones.
  const notifications = [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const questionsPracticed = progress ? progress.totalQuestionsAttempted : null;
  const avgAnswerScore = progress ? `${progress.avgOverallScore}/10` : null;
  const companiesSaved = bookmarks.length;
  const readinessAnalyzed = readiness?.analyzed;
  const readinessScore = readinessAnalyzed ? readiness.data.score : null;

  const stats = [
    {
      label: 'Readiness score',
      value: readinessLoading ? '...' : (readinessAnalyzed ? `${readinessScore}%` : '—'),
      sub: readinessLoading ? '' : (readinessAnalyzed ? 'Based on your last resume analysis' : 'Analyze your resume to get started'),
      subColor: 'text-purple-400',
      path: '/readiness',
    },
    {
      label: 'Questions practiced',
      value: progressLoading ? '...' : (questionsPracticed ?? 0),
      sub: progress && progress.totalQuestionsAttempted > 0 ? 'Keep it up' : 'Start practicing to see progress',
      subColor: 'text-green-400',
      path: '/progress',
    },
    {
      label: 'Avg answer score',
      value: progressLoading ? '...' : (avgAnswerScore ?? '—'),
      sub: progress && progress.totalQuestionsAttempted > 0 ? 'From your recent attempts' : '',
      subColor: 'text-yellow-400',
      path: '/answer-evaluator',
    },
    {
      label: 'Companies saved',
      value: companiesSaved,
      sub: companiesSaved > 0 ? `${companiesSaved} bookmarked` : 'No companies saved yet',
      subColor: 'text-purple-400',
      path: '/bookmarks',
    },
  ];

  // Skill gap analysis is derived from the same topic breakdown used on the
  // Progress Analytics page, so it reflects actual practice, not guesses.
  const skills = (progress?.topicBreakdown || [])
    .slice()
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((t) => ({
      name: t.topic,
      pct: t.avgScore,
      color: statusToColor[t.status] || 'bg-blue-400',
    }));

  const readinessBreakdown = readinessAnalyzed
    ? [
        { label: 'Skills match', pct: readiness.data.skillsMatch, color: 'bg-blue-400' },
        { label: 'Experience', pct: readiness.data.experience, color: 'bg-yellow-400' },
        { label: 'Projects', pct: readiness.data.projects, color: 'bg-green-400' },
        { label: 'Resume quality', pct: readiness.data.resumeQuality, color: 'bg-blue-300' },
      ]
    : [];

  const navItems = [
    { section: 'OVERVIEW', items: [{ label: 'Dashboard', icon: '⊞', active: true }, { label: 'Progress tracker', icon: '📈', path: '/progress' }] },
    { section: 'PREPARATION', items: [{ label: 'Company prep', icon: '🏢', path: '/companies' }, { label: 'Resume upload', icon: '📄', path: '/resume' }, { label: 'Readiness score', icon: '🎯', path: '/readiness' }, { label: 'Skill gap analysis', icon: '📊', path: '/progress' }] },
    { section: 'PRACTICE', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview' }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'Coding round', icon: '💻', path: '/coding-round' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }] },
    { section: 'GUIDES', items: [{ label: 'Dressing guide', icon: '👔', path: '/dressing-guide' }, { label: 'Confidence guide', icon: '🧘', path: '/confidence-guide' }, { label: 'Behavior guide', icon: '🤝', path: '/behavior-guide' }] },
    { section: 'ACCOUNT', items: [{ label: 'Bookmarks', icon: '🔖', path: '/bookmarks' }, { label: 'Settings', icon: '⚙️' }] },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top Navbar */}
      <nav className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">

        {/* Left: Logo + Nav Pills */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">⬡</span>
            <span className="text-white font-bold text-lg">PrepAI</span>
          </div>
          <div className="hidden md:flex gap-2">
            {['Dashboard', 'Companies', 'Practice', 'Guides', 'Progress'].map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveNav(item);
                  if (item === 'Companies') navigate('/companies');
                  if (item === 'Practice') navigate('/mock-interview');
                  if (item === 'Dashboard') navigate('/dashboard');
                  if (item === 'Guides') navigate('/dressing-guide');
                  if (item === 'Progress') navigate('/progress');
                }}
                className="px-5 py-2 rounded-full text-sm font-medium border border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500 hover:text-white transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search + Bell + Avatar */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <input
                type="text"
                autoFocus
                placeholder="Search companies, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
                    setShowSearch(false);
                    setSearchQuery('');
                  }
                }}
                onBlur={() => setTimeout(() => setShowSearch(false), 150)}
                className="w-48 bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                🔍
              </button>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition relative"
            >
              🔔
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                  <p className="font-semibold text-white">Notifications</p>
                </div>
                <div className="px-5 py-8 text-center">
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-600 text-xs mt-1">We'll let you know when there's something new</p>
                </div>
              </div>
            )}

            {showNotifications && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {showProfile && (
              <div className="absolute right-0 top-12 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-purple-900/30 px-5 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user?.name}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                      <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-700">
                  <div className="text-center py-3 border-r border-gray-700">
                    <p className="text-white font-bold text-lg">{readinessLoading ? '...' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                    <p className="text-gray-400 text-xs">Readiness</p>
                  </div>
                  <div className="text-center py-3 border-r border-gray-700">
                    <p className="text-white font-bold text-lg">{progressLoading ? '...' : (questionsPracticed ?? 0)}</p>
                    <p className="text-gray-400 text-xs">Practiced</p>
                  </div>
                  <div className="text-center py-3">
                    <p className="text-white font-bold text-lg">{companiesSaved}</p>
                    <p className="text-gray-400 text-xs">Companies</p>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => { setShowProfile(false); navigate('/resume'); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition text-left"
                  >
                    <span>📄</span> My Resume
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); navigate('/readiness'); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition text-left"
                  >
                    <span>🎯</span> Readiness Score
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition text-left"
                  >
                    <span>⚙️</span> Settings
                  </button>
                </div>

                <div className="border-t border-gray-700 p-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-xl text-sm font-semibold transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {showProfile && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
            )}
          </div>

        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-950 border-r border-gray-800 py-6 px-4 hidden md:block flex-shrink-0">
          {navItems.map((group, gi) => (
            <div key={gi} className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">{group.section}</p>
              {group.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition ${item.active ? 'bg-blue-900/40 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p className="text-gray-400 text-sm">Your interview readiness snapshot for today</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <div
                key={i}
                onClick={() => s.path && navigate(s.path)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 cursor-pointer hover:border-purple-500 transition"
              >
                <p className="text-gray-400 text-xs mb-2">{s.label}</p>
                <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Skill Gap + Readiness Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Skill Gap Analysis */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">🎯 Skill gap analysis</h3>
                <button onClick={() => navigate('/progress')} className="text-blue-400 text-xs hover:underline">View full report</button>
              </div>
              {progressLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : skills.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-gray-400 text-sm">No practice data yet</p>
                  <p className="text-gray-600 text-xs mt-1">Attempt a mock interview or answer evaluator question to see your skill breakdown</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-24 flex-shrink-0">{s.name}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.pct}%` }}></div>
                      </div>
                      <span className="text-gray-400 text-xs w-8 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Readiness Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">🎯 Readiness breakdown</h3>
                <button onClick={() => navigate('/readiness')} className="text-blue-400 text-xs hover:underline">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze resume'}
                </button>
              </div>

              {readinessLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : !readinessAnalyzed ? (
                <div className="py-6 text-center">
                  <p className="text-gray-400 text-sm">You haven't analyzed your resume yet</p>
                  <button
                    onClick={() => navigate('/readiness')}
                    className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Get your readiness score
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                          strokeDasharray={`${readinessScore} ${100 - readinessScore}`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{readinessScore}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {readinessBreakdown.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${r.color}`}></div>
                          <span className="text-gray-400 text-xs">{r.label}</span>
                        </div>
                        <span className="text-white text-xs">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>

    </div>
  );
};

export default Dashboard;