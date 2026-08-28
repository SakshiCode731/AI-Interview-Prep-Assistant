import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import API from '../services/api';

// Color tokens for the "readiness console" theme.
const statusToColor = {
  strong: 'bg-[#37D67A]',
  average: 'bg-[#F2B84B]',
  weak: 'bg-[#F2637A]',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getReadinessLabel = (score) => {
  if (score >= 80) return 'Strong position';
  if (score >= 50) return 'Building steadily';
  return 'Needs attention';
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

// Animated numeric readout. Falls back to a static render for non-numeric values.
const CountUp = ({ value, decimals = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) return;
    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [value, decimals, shouldReduceMotion]);

  if (typeof value !== 'number' || Number.isNaN(value)) return <>{value}</>;
  return <>{decimals ? display.toFixed(decimals) : Math.round(display)}</>;
};

// The signature element: a tick-marked instrument gauge with an animated sweep arc.
const ReadinessGauge = ({ score = 0, active = true, size = 220 }) => {
  const shouldReduceMotion = useReducedMotion();
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);
  const ticks = Array.from({ length: 48 });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FE3C1" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>
      {ticks.map((_, i) => {
        const angle = (i / ticks.length) * 360;
        const major = i % 4 === 0;
        const inner = r + (major ? 13 : 7);
        const outer = r + 17;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + inner * Math.cos(rad)}
            y1={cy + inner * Math.sin(rad)}
            x2={cx + outer * Math.cos(rad)}
            y2={cy + outer * Math.sin(rad)}
            stroke={major ? '#3A4560' : '#20283A'}
            strokeWidth={major ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#161D2C" strokeWidth={10} />
      {active && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.7, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </svg>
  );
};

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

  const shouldReduceMotion = useReducedMotion();

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

  // Skill gap analysis is derived from the same topic breakdown used on the
  // Progress Analytics page, so it reflects actual practice, not guesses.
  const skills = (progress?.topicBreakdown || [])
    .slice()
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((t) => ({
      name: t.topic,
      pct: t.avgScore,
      color: statusToColor[t.status] || 'bg-[#7DD3FC]',
    }));

  const readinessBreakdown = readinessAnalyzed
    ? [
        { label: 'Skills match', pct: readiness.data.skillsMatch, color: 'bg-[#7DD3FC]' },
        { label: 'Experience', pct: readiness.data.experience, color: 'bg-[#F2B84B]' },
        { label: 'Projects', pct: readiness.data.projects, color: 'bg-[#37D67A]' },
        { label: 'Resume quality', pct: readiness.data.resumeQuality, color: 'bg-[#4FE3C1]' },
      ]
    : [];

  const navItems = [
    { section: 'OVERVIEW', items: [{ label: 'Dashboard', icon: '⊞', active: true }, { label: 'Progress tracker', icon: '📈', path: '/progress' }] },
    { section: 'PREPARATION', items: [{ label: 'Company prep', icon: '🏢', path: '/companies' }, { label: 'Resume upload', icon: '📄', path: '/resume' }, { label: 'Readiness score', icon: '🎯', path: '/readiness' }, { label: 'Skill gap analysis', icon: '📊', path: '/progress' }] },
    { section: 'PRACTICE', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'System design', icon: '🏗️', path: '/system-design' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }, { label: 'AI Agent', icon: '🧠', path: '/agent-chat' }] },
    { section: 'GUIDES', items: [{ label: 'Dressing guide', icon: '👔', path: '/dressing-guide' }, { label: 'Confidence guide', icon: '🧘', path: '/confidence-guide' }, { label: 'Behavior guide', icon: '🤝', path: '/behavior-guide' }] },
    { section: 'ACCOUNT', items: [{ label: 'Bookmarks', icon: '🔖', path: '/bookmarks' }, { label: 'Settings', icon: '⚙️' }] },
  ];

  const navPills = ['Dashboard', 'Companies', 'Practice', 'Guides', 'Progress'];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#E7ECF5] flex flex-col relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-console { font-family: 'JetBrains Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,227,193,0.14) 0%, rgba(79,227,193,0) 70%)' }}
          animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.10) 0%, rgba(125,211,252,0) 70%)' }}
          animate={shouldReduceMotion ? {} : { scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-30 bg-[#0A0E17]/90 backdrop-blur border-b border-[#1A2233] px-6 py-3 flex items-center justify-between sticky top-0">

        {/* Left: Logo + Nav Pills */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-display">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#4FE3C1] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4FE3C1]" />
            </span>
            <span className="text-white font-bold text-lg tracking-tight">PrepAI</span>
          </div>
          <div className="hidden md:flex gap-1 relative bg-[#0F1520] border border-[#1E2636] rounded-full p-1">
            {navPills.map((item, i) => (
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
                className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-colors z-10 ${
                  activeNav === item ? 'text-[#06110E]' : 'text-[#8892A6] hover:text-white'
                }`}
              >
                {activeNav === item && (
                  <motion.span
                    layoutId="navPill"
                    className="absolute inset-0 rounded-full bg-[#4FE3C1] -z-10"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search + Bell + Avatar */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.input
                  key="search-input"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 192, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
                  className="bg-[#0F1520] border border-[#1E2636] rounded-full px-4 py-1.5 text-sm text-white placeholder-[#5B6478] focus:outline-none focus:border-[#4FE3C1]"
                />
              ) : (
                <motion.button
                  key="search-icon"
                  onClick={() => setShowSearch(true)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-9 h-9 flex items-center justify-center text-[#8892A6] hover:text-white transition"
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
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="w-9 h-9 flex items-center justify-center text-[#8892A6] hover:text-white transition relative"
            >
              🔔
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F2637A] rounded-full"></span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-80 bg-[#0F1520] border border-[#1E2636] rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2636]">
                    <p className="font-semibold text-white font-display">Notifications</p>
                  </div>
                  <div className="px-5 py-8 text-center">
                    <p className="text-[#8892A6] text-sm">No notifications yet</p>
                    <p className="text-[#5B6478] text-xs mt-1">We'll let you know when there's something new</p>
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
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4FE3C1] to-[#7DD3FC] flex items-center justify-center text-sm font-bold text-[#06110E] cursor-pointer transition font-display"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-72 bg-[#0F1520] border border-[#1E2636] rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="bg-[#4FE3C1]/10 px-5 py-4 border-b border-[#1E2636]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4FE3C1] to-[#7DD3FC] flex items-center justify-center text-lg font-bold text-[#06110E] flex-shrink-0 font-display">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.name}</p>
                        <p className="text-[#8892A6] text-xs">{user?.email}</p>
                        <span className="text-xs bg-[#37D67A]/15 text-[#37D67A] px-2 py-0.5 rounded-full mt-1 inline-block">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-b border-[#1E2636] font-mono-console">
                    <div className="text-center py-3 border-r border-[#1E2636]">
                      <p className="text-white font-bold text-lg">{readinessLoading ? '...' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                      <p className="text-[#8892A6] text-xs font-body">Readiness</p>
                    </div>
                    <div className="text-center py-3 border-r border-[#1E2636]">
                      <p className="text-white font-bold text-lg">{progressLoading ? '...' : (questionsPracticed ?? 0)}</p>
                      <p className="text-[#8892A6] text-xs font-body">Practiced</p>
                    </div>
                    <div className="text-center py-3">
                      <p className="text-white font-bold text-lg">{companiesSaved}</p>
                      <p className="text-[#8892A6] text-xs font-body">Companies</p>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => { setShowProfile(false); navigate('/resume'); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#B7BECC] hover:bg-[#151C2B] hover:text-white transition text-left"
                    >
                      <span>📄</span> My Resume
                    </button>
                    <button
                      onClick={() => { setShowProfile(false); navigate('/readiness'); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#B7BECC] hover:bg-[#151C2B] hover:text-white transition text-left"
                    >
                      <span>🎯</span> Readiness Score
                    </button>
                    <button
                      onClick={() => { setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#B7BECC] hover:bg-[#151C2B] hover:text-white transition text-left"
                    >
                      <span>⚙️</span> Settings
                    </button>
                  </div>

                  <div className="border-t border-[#1E2636] p-3">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-[#F2637A]/10 hover:bg-[#F2637A]/20 text-[#F2637A] rounded-xl text-sm font-semibold transition"
                    >
                      Logout
                    </button>
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

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <aside className="w-56 bg-transparent border-r border-[#1A2233] py-6 px-4 hidden md:block flex-shrink-0">
          {navItems.map((group, gi) => (
            <div key={gi} className="mb-5">
              <p className="text-[10px] text-[#5B6478] uppercase tracking-[0.2em] mb-2 px-2 font-mono-console">{group.section}</p>
              {group.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition ${
                    item.active ? 'bg-[#4FE3C1]/10 text-[#4FE3C1]' : 'text-[#8892A6] hover:text-white hover:bg-[#121826]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-[#4FE3C1]/15 text-[#4FE3C1] px-1.5 py-0.5 rounded-full font-mono-console">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 p-6 overflow-y-auto"
        >
          <motion.div variants={itemVariants} className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold font-display">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
              <p className="text-[#8892A6] text-sm">Your interview readiness snapshot for today</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5B6478] font-mono-console border border-[#1E2636] bg-[#0F1520] rounded-full px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#37D67A] opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#37D67A]" />
              </span>
              CONSOLE ONLINE
            </div>
          </motion.div>

          {/* Hero row: readiness console + stacked readouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

            {/* Readiness gauge — signature element */}
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/readiness')}
              className="lg:col-span-2 relative bg-[#111827] border border-[#1E2636] rounded-2xl p-6 cursor-pointer overflow-hidden flex flex-col sm:flex-row items-center gap-6 hover:border-[#4FE3C1]/50 transition-colors"
            >
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 224, height: 224 }}>
                <ReadinessGauge score={readinessAnalyzed ? readinessScore : 0} active={!readinessLoading} size={224} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <span className="text-[10px] tracking-[0.25em] text-[#5B6478] font-mono-console">OVERALL READINESS</span>
                  <span className="text-5xl font-bold font-mono-console mt-2 leading-none">
                    {readinessLoading ? (
                      <span className="text-[#5B6478]">—</span>
                    ) : readinessAnalyzed ? (
                      <>
                        <CountUp value={readinessScore} />
                        <span className="text-lg text-[#5B6478]">%</span>
                      </>
                    ) : (
                      <span className="text-[#5B6478]">—</span>
                    )}
                  </span>
                  <span className="text-xs text-[#8892A6] mt-2 max-w-[170px] font-body">
                    {readinessLoading
                      ? 'Reading signal…'
                      : readinessAnalyzed
                        ? getReadinessLabel(readinessScore)
                        : 'Analyze your resume to activate'}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold font-display text-lg mb-1">Readiness console</h3>
                <p className="text-[#8892A6] text-sm mb-4">
                  {readinessAnalyzed
                    ? 'Based on your last resume analysis. Re-run it any time your resume changes.'
                    : 'Upload your resume to calibrate your readiness score and unlock a full breakdown.'}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#06110E] bg-[#4FE3C1] hover:bg-[#3FD0B3] transition px-4 py-2 rounded-xl">
                  {readinessAnalyzed ? 'Re-analyze resume' : 'Get your readiness score'} →
                </span>
              </div>
            </motion.div>

            {/* Stacked readouts */}
            <div className="flex flex-col gap-4">
              {[
                {
                  label: 'Questions practiced',
                  value: questionsPracticed,
                  loading: progressLoading,
                  sub: progress && progress.totalQuestionsAttempted > 0 ? 'Keep it up' : 'Start practicing to see progress',
                  accent: '#4FE3C1',
                  path: '/progress',
                },
                {
                  label: 'Avg answer score',
                  value: progress?.avgOverallScore,
                  suffix: '/10',
                  decimals: 1,
                  loading: progressLoading,
                  sub: progress && progress.totalQuestionsAttempted > 0 ? 'From your recent attempts' : 'No attempts yet',
                  accent: '#F2B84B',
                  path: '/answer-evaluator',
                },
                {
                  label: 'Companies saved',
                  value: companiesSaved,
                  loading: false,
                  sub: companiesSaved > 0 ? `${companiesSaved} bookmarked` : 'No companies saved yet',
                  accent: '#7DD3FC',
                  path: '/bookmarks',
                },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  onClick={() => navigate(m.path)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#111827] border border-[#1E2636] rounded-2xl p-4 cursor-pointer transition-colors hover:border-[#2A3550] flex items-center gap-4"
                >
                  <div
                    className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.accent, opacity: 0.7 }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[#8892A6] text-xs mb-1 font-body">{m.label}</p>
                    <p className="text-2xl font-bold font-mono-console leading-none">
                      {m.loading ? (
                        <span className="text-[#5B6478]">···</span>
                      ) : (
                        <>
                          <CountUp value={m.value ?? 0} decimals={m.decimals || 0} />
                          {m.suffix && <span className="text-sm text-[#5B6478]">{m.suffix}</span>}
                        </>
                      )}
                    </p>
                    <p className="text-[11px] mt-1 truncate" style={{ color: m.accent }}>{m.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Skill Gap + Readiness Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Skill Gap Analysis — horizontal signal meters */}
            <motion.div variants={itemVariants} className="bg-[#111827] border border-[#1E2636] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold font-display">🎯 Skill gap analysis</h3>
                <button onClick={() => navigate('/progress')} className="text-[#7DD3FC] text-xs hover:underline">View full report</button>
              </div>
              {progressLoading ? (
                <p className="text-[#5B6478] text-sm">Reading signal…</p>
              ) : skills.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-[#8892A6] text-sm">No practice data yet</p>
                  <p className="text-[#5B6478] text-xs mt-1">Attempt a mock interview or answer evaluator question to see your skill breakdown</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#8892A6] text-xs w-24 flex-shrink-0 truncate font-body">{s.name}</span>
                      <div className="relative flex-1 bg-[#0B1018] rounded-full h-2.5 overflow-hidden">
                        <div className="absolute inset-0 flex justify-between px-px">
                          {Array.from({ length: 9 }).map((_, t) => (
                            <span key={t} className="w-px h-full bg-[#1E2636]" />
                          ))}
                        </div>
                        <motion.div
                          className={`${s.color} h-full rounded-full relative`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="text-[#B7BECC] text-xs w-9 text-right font-mono-console">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Readiness Breakdown — vertical signal bars */}
            <motion.div variants={itemVariants} className="bg-[#111827] border border-[#1E2636] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold font-display">🎯 Readiness breakdown</h3>
                <button onClick={() => navigate('/readiness')} className="text-[#7DD3FC] text-xs hover:underline">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze resume'}
                </button>
              </div>

              {readinessLoading ? (
                <p className="text-[#5B6478] text-sm">Reading signal…</p>
              ) : !readinessAnalyzed ? (
                <div className="py-6 text-center">
                  <p className="text-[#8892A6] text-sm">You haven't analyzed your resume yet</p>
                  <button
                    onClick={() => navigate('/readiness')}
                    className="mt-3 px-4 py-2 bg-[#4FE3C1] hover:bg-[#3FD0B3] text-[#06110E] text-xs font-semibold rounded-xl transition"
                  >
                    Get your readiness score
                  </button>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-3 h-32 mt-1">
                  {readinessBreakdown.map((r, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col items-center gap-2">
                      <span className="text-[11px] font-mono-console text-[#B7BECC]">{r.pct}%</span>
                      <div className="w-full flex-1 flex items-end bg-[#0B1018] rounded-md overflow-hidden">
                        <motion.div
                          className={`${r.color} w-full rounded-t-md`}
                          initial={{ height: 0 }}
                          animate={{ height: `${r.pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="text-[10px] text-[#5B6478] text-center leading-tight font-body">{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </motion.main>
      </div>

    </div>
  );
};

export default Dashboard;