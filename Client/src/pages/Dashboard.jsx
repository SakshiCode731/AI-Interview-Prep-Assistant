import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [dressingTab, setDressingTab] = useState('male');
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [profileData] = useState({ name: 'Sakshi Gautam', email: 'sakshi@test.com' });
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notifications, setNotifications] = useState([
    { 
      id: 1, icon: '🎯', title: 'Readiness score updated', desc: 'Your score improved to 70% this week', time: '2h ago', unread: true,
      fullDetail: 'Your interview readiness score has improved from 65% to 70% this week! This is based on your recent activity — completing 3 mock interviews, updating your resume, and improving your DSA skill score by 8%. Keep practicing to reach 80%+ readiness.',
      action: '/progress'
    },
    { 
      id: 2, icon: '🏢', title: 'New drive announced', desc: 'Amazon campus drive scheduled next week', time: '5h ago', unread: true,
      fullDetail: 'Amazon has announced a campus recruitment drive scheduled for next week. The process includes an Online Assessment, 2 Technical Rounds, a Bar Raiser round, and an HR round. Required skills: DSA, System Design, Problem Solving, and Leadership Principles. Make sure your resume and readiness score are up to date before the drive.',
      action: '/companies'
    },
    { 
      id: 3, icon: '❓', title: 'Practice reminder', desc: "You haven't practiced mock interview in 3 days", time: '1d ago', unread: false,
      fullDetail: "It's been 3 days since your last mock interview practice session. Regular practice helps build confidence and improves your answer quality. Consider doing at least one mock interview session today to stay on track with your preparation goals.",
      action: '/mock-interview'
    },
    { 
      id: 4, icon: '✅', title: 'Answer evaluated', desc: 'Your DSA answer scored 8/10', time: '2d ago', unread: false,
      fullDetail: 'Your answer to "Reverse a linked list iteratively" was evaluated and scored 8/10. Strengths: Clear approach, correct time complexity explanation. Improvement area: Consider mentioning edge cases like empty list or single node scenarios in your answer.',
      action: '/answer-evaluator'
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  const navItems = [
    { section: 'OVERVIEW', items: [{ label: 'Dashboard', icon: '⊞', active: true }, { label: 'Progress tracker', icon: '📈', path: '/progress' }] },
    { section: 'PREPARATION', items: [{ label: 'Company prep', icon: '🏢', path: '/companies' }, { label: 'Resume upload', icon: '📄', path: '/resume' }, { label: 'Readiness score', icon: '🎯', path: '/readiness' }, { label: 'Skill gap analysis', icon: '📊', path: '/progress' }] },
    { section: 'PRACTICE', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'Coding round', icon: '💻', path: '/coding-round' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }] },
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
                  <span className="text-xs text-purple-400">
                    {notifications.filter(n => n.unread).length} new
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNotification(n);
                        setShowNotifications(false);
                      }}
                      className={`flex items-start gap-3 px-5 py-3 border-b border-gray-800 hover:bg-gray-800 transition cursor-pointer ${n.unread ? 'bg-gray-800/40' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                        {n.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{n.title}</p>
                          {n.unread && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{n.time}</p>
                          {n.unread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                              className="text-xs text-purple-400 hover:text-purple-300 transition"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-700">
                  <button
                    onClick={markAllAsRead}
                    className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Mark all as read
                  </button>
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
              S
            </div>

            {showProfile && (
              <div className="absolute right-0 top-12 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-purple-900/30 px-5 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                      S
                    </div>
                    <div>
                      <p className="font-semibold text-white">{profileData.name}</p>
                      <p className="text-gray-400 text-xs">{profileData.email}</p>
                      <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-700">
                  <div className="text-center py-3 border-r border-gray-700">
                    <p className="text-white font-bold text-lg">70%</p>
                    <p className="text-gray-400 text-xs">Readiness</p>
                  </div>
                  <div className="text-center py-3 border-r border-gray-700">
                    <p className="text-white font-bold text-lg">24</p>
                    <p className="text-gray-400 text-xs">Practiced</p>
                  </div>
                  <div className="text-center py-3">
                    <p className="text-white font-bold text-lg">5</p>
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
                  {item.badge && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Good morning, Sakshi</h1>
            <p className="text-gray-400 text-sm">Your interview readiness snapshot for today</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
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
            </div>

            {/* Readiness Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">🎯 Readiness breakdown</h3>
                <button onClick={() => navigate('/progress')} className="text-blue-400 text-xs hover:underline">View full report</button>
              </div>
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray="70 30" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">70</span>
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
            </div>

          </div>
        </main>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                {selectedNotification.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{selectedNotification.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{selectedNotification.time}</p>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-300 text-sm leading-relaxed">{selectedNotification.fullDetail}</p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-2.5 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(selectedNotification.action);
                  setSelectedNotification(null);
                }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition"
              >
                View Details →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;