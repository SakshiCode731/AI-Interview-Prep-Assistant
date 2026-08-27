import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import API from '../services/api';

const statusToColor = {
  strong: 'bg-green-500',
  average: 'bg-yellow-400',
  weak: 'bg-red-500',
};

// ---------------------------------------------------------------------------
// Animation helpers (visual-only additions — no data/logic changes)
// ---------------------------------------------------------------------------

// Generic count-up hook. Animates any numeric target from 0 -> target using
// requestAnimationFrame + an ease-out curve. Safe to call unconditionally
// even when the target isn't a valid number yet (falls back to 0).
function useCountUp(target, duration = 900) {
  const safeTarget = typeof target === 'number' && !Number.isNaN(target) ? target : 0;
  const [value, setValue] = useState(0);

  useEffect(() => {
    let rafId;
    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(safeTarget * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setValue(safeTarget);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTarget, duration]);

  return value;
}

// Renders a stat's value with the numeric portion counting up from 0.
// Handles plain numbers ("8"), decimals with suffix ("8.1/10"), percentages
// ("85%"), and non-numeric placeholders ("...", "—") without changing what
// is actually displayed once the animation settles.
function AnimatedStatValue({ value }) {
  const str = String(value);
  const match = str.match(/^(-?\d+(\.\d+)?)/);
  const numStr = match ? match[1] : null;
  const suffix = numStr ? str.slice(numStr.length) : '';
  const decimals = numStr && numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const target = numStr ? parseFloat(numStr) : 0;

  const animated = useCountUp(target, 900); // always called — keeps hook order stable

  if (!numStr) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}
      {suffix}
    </span>
  );
}

// A single skill-gap row: label + animated fill bar + count-up percentage.
function SkillRow({ name, pct, color, index }) {
  const animatedPct = useCountUp(pct, 900);

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.08 }}
    >
      <span className="text-gray-400 text-xs w-24 flex-shrink-0">{name}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`${color} h-2 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2 + index * 0.08, ease: 'easeOut' }}
        />
      </div>
      <span className="text-gray-400 text-xs w-8 text-right">{Math.round(animatedPct)}%</span>
    </motion.div>
  );
}

// A single readiness-breakdown row: colored dot + label + count-up percentage.
function ReadinessRow({ label, pct, color, index }) {
  const animatedPct = useCountUp(pct, 900);

  return (
    <motion.div
      className="flex items-center justify-between text-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 + index * 0.08 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${color}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 + index * 0.08 }}
        />
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <span className="text-white text-xs">{Math.round(animatedPct)}%</span>
    </motion.div>
  );
}

// Stagger containers for the stats grid
const statsContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const statsItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------

// Dashboard page: shows a snapshot of the user's readiness, progress, and bookmarks, along with navigation to other parts of the app.

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
    { section: 'PRACTICE', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'System design', icon: '🏗️', path: '/system-design' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }] },
    { section: 'GUIDES', items: [{ label: 'Dressing guide', icon: '👔', path: '/dressing-guide' }, { label: 'Confidence guide', icon: '🧘', path: '/confidence-guide' }, { label: 'Behavior guide', icon: '🤝', path: '/behavior-guide' }] },
    { section: 'ACCOUNT', items: [{ label: 'Bookmarks', icon: '🔖', path: '/bookmarks' }, { label: 'Settings', icon: '⚙️' }] },
  ];

  // Center number on the readiness ring — counts up alongside the ring fill.
  const animatedReadinessScore = useCountUp(readinessAnalyzed ? readinessScore : 0, 1100);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top Navbar */}
      <nav className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">

        {/* Left: Logo + Nav Pills */}
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-blue-400 text-xl">⬡</span>
            <span className="text-white font-bold text-lg">PrepAI</span>
          </motion.div>
          <div className="hidden md:flex gap-2">
            {['Dashboard', 'Companies', 'Practice', 'Guides', 'Progress'].map((item, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setActiveNav(item);
                  if (item === 'Companies') navigate('/companies');
                  if (item === 'Practice') navigate('/mock-interview');
                  if (item === 'Dashboard') navigate('/dashboard');
                  if (item === 'Guides') navigate('/dressing-guide');
                  if (item === 'Progress') navigate('/progress');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="relative px-5 py-2 rounded-full text-sm font-medium border border-gray-700 text-gray-200 hover:border-gray-500 hover:text-white transition-colors"
              >
                {activeNav === item && (
                  <motion.span
                    layoutId="navActivePill"
                    className="absolute inset-0 bg-gray-800 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Search + Bell + Avatar */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {showSearch ? (
                <motion.input
                  key="search-input"
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
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 192, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              ) : (
                <motion.button
                  key="search-icon"
                  onClick={() => setShowSearch(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  🔍
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition relative"
            >
              🔔
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                    <p className="font-semibold text-white">Notifications</p>
                  </div>
                  <div className="px-5 py-8 text-center">
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                    <p className="text-gray-600 text-xs mt-1">We'll let you know when there's something new</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showNotifications && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <motion.div
              className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
              onClick={() => setShowProfile(!showProfile)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
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
                    <motion.button
                      onClick={handleLogout}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-xl text-sm font-semibold transition"
                    >
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                <motion.button
                  key={ii}
                  onClick={() => item.path && navigate(item.path)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${item.active ? 'bg-blue-900/40 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                </motion.button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p className="text-gray-400 text-sm">Your interview readiness snapshot for today</p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={statsContainerVariants}
            initial="hidden"
            animate="show"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={statsItemVariants}
                onClick={() => s.path && navigate(s.path)}
                whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 30px -8px rgba(168, 85, 247, 0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 cursor-pointer hover:border-purple-500 transition-colors"
              >
                <p className="text-gray-400 text-xs mb-2">{s.label}</p>
                <p className="text-2xl font-bold text-white mb-1">
                  <AnimatedStatValue value={s.value} />
                </p>
                <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Skill Gap + Readiness Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Skill Gap Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              whileHover={{ y: -2, boxShadow: '0 12px 30px -10px rgba(59, 130, 246, 0.25)' }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
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
                    <SkillRow key={i} name={s.name} pct={s.pct} color={s.color} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Readiness Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              whileHover={{ y: -2, boxShadow: '0 12px 30px -10px rgba(59, 130, 246, 0.25)' }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
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
                  <motion.button
                    onClick={() => navigate('/readiness')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Get your readiness score
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                        <motion.circle
                          cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 100' }}
                          animate={{ strokeDasharray: `${readinessScore} ${100 - readinessScore}` }}
                          transition={{ duration: 1.1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{Math.round(animatedReadinessScore)}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {readinessBreakdown.map((r, i) => (
                      <ReadinessRow key={i} label={r.label} pct={r.pct} color={r.color} index={i} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

          </div>
        </main>
      </div>

    </div>
  );
};

export default Dashboard;