import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dressingTab, setDressingTab] = useState('male');
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [profileData, setProfileData] = useState({ name: 'Sakshi Gautam', email: 'sakshi@test.com' });

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

  const companies = [
    { abbr: 'TCS', name: 'Tata Consultancy Services', rounds: '4 rounds', skills: 'Java, DSA, SQL', diff: 'Easy', diffColor: 'bg-green-900 text-green-400' },
    { abbr: 'INF', name: 'Infosys', rounds: '3 rounds', skills: 'Python, DSA', diff: 'Easy', diffColor: 'bg-green-900 text-green-400' },
    { abbr: 'WIP', name: 'Wipro', rounds: '4 rounds', skills: 'C++, Java, DSA', diff: 'Medium', diffColor: 'bg-yellow-900 text-yellow-400' },
    { abbr: 'AMZ', name: 'Amazon', rounds: '5 rounds', skills: 'DSA, System Design', diff: 'Hard', diffColor: 'bg-red-900 text-red-400' },
  ];

  const readinessBreakdown = [
    { label: 'Skills match', pct: 75, color: 'bg-blue-400' },
    { label: 'Experience', pct: 40, color: 'bg-yellow-400' },
    { label: 'Projects', pct: 80, color: 'bg-green-400' },
    { label: 'Resume quality', pct: 65, color: 'bg-blue-300' },
  ];

  const mockQuestions = [
    { q: 'Explain difference between var, let and const', tag: 'Technical', tagColor: 'bg-blue-900 text-blue-300', score: '8/10' },
    { q: 'Design a URL shortener like bit.ly', tag: 'System Design', tagColor: 'bg-yellow-900 text-yellow-300', score: '6/10' },
    { q: 'Reverse a linked list iteratively', tag: 'DSA', tagColor: 'bg-purple-900 text-purple-300', score: '7/10' },
  ];

  const behaviorItems = [
    { icon: '🚪', title: 'Entering the room', desc: 'Knock before entering, greet with a smile, wait to be seated.' },
    { icon: '👁️', title: 'Eye contact', desc: 'Maintain 70% eye contact — confident but not intense.' },
    { icon: '🗣️', title: 'Communication', desc: 'Speak clearly, pause before answering, avoid filler words.' },
  ];

  const confidenceTips = [
    { icon: '💨', title: 'Breathing exercise', desc: '4-7-8 method: inhale 4 sec, hold 7, exhale 8. Repeat 3 times before interview.' },
    { icon: '🧠', title: 'Mental preparation', desc: 'Visualize success. Remind yourself of your strengths and past achievements.' },
    { icon: '🏃', title: 'Avoid overthinking', desc: 'Focus on one question at a time. It\'s okay to say "let me think for a moment."' },
    { icon: '⏰', title: 'Arrive early', desc: 'Reach 15 mins before. Use the time to calm down, not to cram.' },
    { icon: '👍', title: 'Positive body language', desc: 'Sit upright, uncross arms, nod while listening to show engagement.' },
    { icon: '⭐', title: 'Confidence building', desc: 'Practice mock answers aloud. Confidence comes from repetition, not perfection.' },
  ];

  const dressingDos = {
    male: ['Formal shirt + trousers', 'Clean polished shoes', 'Neutral colors — navy, grey', 'Well-ironed clothes'],
    female: ['Formal salwar suit', 'Closed-toe formal shoes', 'Minimal jewellery', 'Neat, tied hair'],
  };
  const dressingDonts = {
    male: ['Loud / bright colors', 'Casual jeans or t-shirts', 'Heavy accessories', 'Strong perfume'],
    female: ['Heavy jewellery', 'Casual kurtis or jeans', 'Bold makeup', 'Very high heels'],
  };

  const navItems = [
    { section: 'OVERVIEW', items: [{ label: 'Dashboard', icon: '⊞', active: true }, { label: 'Progress tracker', icon: '📈' }] },
    { section: 'PREPARATION', items: [{ label: 'Company prep', icon: '🏢', path: '/companies' }, { label: 'Resume upload', icon: '📄', path: '/resume' }, { label: 'Readiness score', icon: '🎯', path: '/readiness' }, { label: 'Skill gap analysis', icon: '📊' }] },
    { section: 'PRACTICE', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }] },
    { section: 'GUIDES', items: [{ label: 'Dressing guide', icon: '👔', path: '/dressing-guide' }, { label: 'Confidence guide', icon: '🧘', path: '/confidence-guide' }, { label: 'Behavior guide', icon: '🤝', path: '/behavior-guide' }] },
    { section: 'ACCOUNT', items: [{ label: 'Bookmarks', icon: '🔖' }, { label: 'Settings', icon: '⚙️' }] },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Navbar */}
     <nav className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">

  {/* Left: Logo + Nav Pills */}
  <div className="flex items-center gap-6">

    {/* Logo */}
    <div className="flex items-center gap-2">
      <span className="text-blue-400 text-xl">⬡</span>
      <span className="text-white font-bold text-lg">PrepAI</span>
    </div>

    {/* Nav Pills */}
    <div className="hidden md:flex gap-2">
      {['Dashboard', 'Companies', 'Practice', 'Guides', 'Progress'].map((item, i) => (
        <button
          key={i}
          onClick={() => {
            setActiveNav(item);
            if (item === 'Companies') navigate('/companies');
            if (item === 'Practice') navigate('/mock-interview');
            if (item === 'Dashboard') navigate('/dashboard');
          }}
          className="px-5 py-2 rounded-full text-sm font-medium border border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500 hover:text-white transition"
        >
          {item}
        </button>
      ))}
    </div>

  </div>
  {/* ✅ Left wrapper yahan close hua */}

  {/* Right: Search + Bell + Avatar */}
  <div className="flex items-center gap-3 relative">

    {/* Search Button */}
    <div className="relative">
      {showSearch ? (
        <input
          type="text"
          autoFocus
          placeholder="Search companies, guides..."
          onBlur={() => setShowSearch(false)}
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
    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition relative">
      🔔
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>

    {/* Avatar Button */}
    <div
      className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
      onClick={() => setShowProfile(!showProfile)}
    >
      S
    </div>

    {/* Profile Dropdown */}
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

    {/* Click outside to close */}
    {showProfile && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowProfile(false)}
      />
    )}

  </div>
  {/* Right wrapper close */}

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
          {/* Header */}
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

          {/* Skill Gap + Company Prep */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Skill Gap */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">🎯 Skill gap analysis</h3>
                <button onClick={() => navigate('/readiness')} className="text-blue-400 text-xs hover:underline">View all</button>
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

            {/* Company Prep */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">🏢 Company prep</h3>
                <button onClick={() => navigate('/companies')} className="text-blue-400 text-xs hover:underline">Browse all</button>
              </div>
              <div className="space-y-3">
                {companies.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">{c.abbr}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.rounds} · {c.skills}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.diffColor}`}>{c.diff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readiness + Chatbot + Mock Interview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Readiness Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">🎯 Readiness breakdown</h3>
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

            {/* AI Chatbot */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">🤖 AI chatbot</h3>
              <div className="bg-gray-800 rounded-xl p-3 text-sm text-gray-300 mb-3">
                Hi Sakshi! Ready to prep? Ask me anything about interviews.
              </div>
              <div className="bg-blue-700 rounded-xl p-3 text-sm text-white mb-3">
                How to prepare for Amazon?
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-sm text-gray-300 mb-3">
                Focus on DSA (LeetCode medium) + Leadership Principles. Practice STAR method stories for behavioral rounds.
              </div>
              <button onClick={() => navigate('/chatbot')} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition">
                Open Chatbot →
              </button>
            </div>

            {/* Mock Interview */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">❓ Mock interview</h3>
              <div className="space-y-3">
                {mockQuestions.map((q, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-3">
                    <p className="text-sm text-white mb-2">{q.q}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${q.tagColor}`}>{q.tag}</span>
                      <span className="text-xs text-gray-400">Score: {q.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/mock-interview')} className="w-full mt-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition">
                Start Practice →
              </button>
            </div>
          </div>

          {/* Dressing Guide + Behavior Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Dressing Guide */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">👔 Dressing guide</h3>
                <button onClick={() => navigate('/dressing-guide')} className="text-blue-400 text-xs hover:underline">View full</button>
              </div>
              <div className="flex gap-2 mb-4">
                {['male', 'female'].map(t => (
                  <button key={t} onClick={() => setDressingTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition ${dressingTab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
                    {t === 'male' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-green-400 text-xs font-semibold mb-2">✓ Do's</p>
                  <ul className="space-y-1">
                    {dressingDos[dressingTab].map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-green-400 mt-0.5">•</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-red-400 text-xs font-semibold mb-2">✗ Don'ts</p>
                  <ul className="space-y-1">
                    {dressingDonts[dressingTab].map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-red-400 mt-0.5">•</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Behavior Guide */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">🤝 Behavior guide</h3>
                <button onClick={() => navigate('/behavior-guide')} className="text-blue-400 text-xs hover:underline">View full</button>
              </div>
              <div className="space-y-3">
                {behaviorItems.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">{b.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                      <p className="text-xs text-gray-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Guide */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">🧘 Confidence and calmness guide</h3>
              <button onClick={() => navigate('/confidence-guide')} className="text-blue-400 text-xs hover:underline">View full</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {confidenceTips.map((tip, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <p className="text-sm font-semibold text-white mb-1">{tip.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;