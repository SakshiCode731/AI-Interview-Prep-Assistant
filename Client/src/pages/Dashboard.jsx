import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import API from '../services/api';

const statusToColor = {
  strong: 'bg-emerald-400',
  average: 'bg-amber-400',
  weak: 'bg-rose-400',
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
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

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
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [value, decimals, shouldReduceMotion]);

  if (typeof value !== 'number' || Number.isNaN(value)) return <>{value}</>;
  return <>{decimals ? display.toFixed(decimals) : Math.round(display)}</>;
};

// Refined gauge: thinner ring, no tick marks, quieter — reads as instrumentation, not decoration.
const ReadinessGauge = ({ score = 0, active = true, size = 176 }) => {
  const shouldReduceMotion = useReducedMotion();
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1B1E27" strokeWidth={8} />
      {active && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#6366F1"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </svg>
  );
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [readiness, setReadiness] = useState(null);
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

  const notifications = [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const questionsPracticed = progress ? progress.totalQuestionsAttempted : null;
  const companiesSaved = bookmarks.length;
  const readinessAnalyzed = readiness?.analyzed;
  const readinessScore = readinessAnalyzed ? readiness.data.score : null;

  const skills = (progress?.topicBreakdown || [])
    .slice()
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((t) => ({
      name: t.topic,
      pct: t.avgScore,
      color: statusToColor[t.status] || 'bg-indigo-400',
    }));

  const readinessBreakdown = readinessAnalyzed
    ? [
        { label: 'Skills match', pct: readiness.data.skillsMatch },
        { label: 'Experience', pct: readiness.data.experience },
        { label: 'Projects', pct: readiness.data.projects },
        { label: 'Resume quality', pct: readiness.data.resumeQuality },
      ]
    : [];

  const navItems = [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: '⊞', path: '/dashboard', active: true }, { label: 'Progress tracker', icon: '📈', path: '/progress' }] },
    { section: 'Preparation', items: [{ label: 'Company prep', icon: '🏢', path: '/companies' }, { label: 'Resume upload', icon: '📄', path: '/resume' }, { label: 'Readiness score', icon: '🎯', path: '/readiness' }, { label: 'Skill gap analysis', icon: '📊', path: '/progress' }] },
    { section: 'Practice', items: [{ label: 'Mock interview', icon: '❓', path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: '✅', path: '/answer-evaluator' }, { label: 'System design', icon: '🏗️', path: '/system-design' }, { label: 'AI chatbot', icon: '🤖', path: '/chatbot' }, { label: 'AI Agent', icon: '🧠', path: '/agent-chat' }] },
    { section: 'Guides', items: [{ label: 'Dressing guide', icon: '👔', path: '/dressing-guide' }, { label: 'Confidence guide', icon: '🧘', path: '/confidence-guide' }, { label: 'Behavior guide', icon: '🤝', path: '/behavior-guide' }] },
    { section: 'Account', items: [{ label: 'Bookmarks', icon: '🔖', path: '/bookmarks' }, { label: 'Settings', icon: '⚙️' }] },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#EDEEF2] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-data { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-60 bg-[#0D0F16] border-r border-[#1B1E27] flex flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[#1B1E27] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm font-bold font-sans">P</div>
          <span className="font-semibold text-[15px] tracking-tight font-sans">PrepAI</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((group, gi) => (
            <div key={gi} className="mb-5">
              <p className="text-[10px] text-[#565C6E] uppercase tracking-[0.14em] mb-1.5 px-2.5 font-sans font-medium">{group.section}</p>
              {group.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13.5px] mb-0.5 transition font-sans ${
                    item.active
                      ? 'bg-indigo-500/12 text-indigo-300 font-medium'
                      : 'text-[#9195A6] hover:text-[#EDEEF2] hover:bg-[#161923]'
                  }`}
                >
                  <span className="text-[13px] w-4 text-center opacity-90">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded-full font-data">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#1B1E27] p-3">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#161923] transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 font-sans">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate font-sans">{user?.name || 'User'}</p>
                <p className="text-[11px] text-[#565C6E] truncate font-sans">{user?.email}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 bottom-full mb-2 w-64 bg-[#14161D] border border-[#1B1E27] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="grid grid-cols-3 border-b border-[#1B1E27] font-data">
                    <div className="text-center py-3 border-r border-[#1B1E27]">
                      <p className="text-white font-semibold text-[15px]">{readinessLoading ? '···' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                      <p className="text-[#565C6E] text-[10px] font-sans mt-0.5">Readiness</p>
                    </div>
                    <div className="text-center py-3 border-r border-[#1B1E27]">
                      <p className="text-white font-semibold text-[15px]">{progressLoading ? '···' : (questionsPracticed ?? 0)}</p>
                      <p className="text-[#565C6E] text-[10px] font-sans mt-0.5">Practiced</p>
                    </div>
                    <div className="text-center py-3">
                      <p className="text-white font-semibold text-[15px]">{companiesSaved}</p>
                      <p className="text-[#565C6E] text-[10px] font-sans mt-0.5">Companies</p>
                    </div>
                  </div>
                  <div className="py-1.5">
                    <button onClick={() => { setShowProfile(false); navigate('/resume'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#9195A6] hover:bg-[#1B1E27] hover:text-white transition text-left font-sans">
                      <span>📄</span> My Resume
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/readiness'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#9195A6] hover:bg-[#1B1E27] hover:text-white transition text-left font-sans">
                      <span>🎯</span> Readiness Score
                    </button>
                  </div>
                  <div className="border-t border-[#1B1E27] p-2.5">
                    <button onClick={handleLogout} className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[13px] font-medium transition font-sans">
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {showProfile && <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top strip: search + bell */}
        <header className="h-16 border-b border-[#1B1E27] px-8 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#0B0D12]/95 backdrop-blur z-20">
          <div className="relative">
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.input
                  key="search-input"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
                  className="bg-[#14161D] border border-[#23262F] rounded-lg px-3.5 py-1.5 text-[13px] text-white placeholder-[#565C6E] focus:outline-none focus:border-indigo-500 font-sans"
                />
              ) : (
                <motion.button
                  key="search-icon"
                  onClick={() => setShowSearch(true)}
                  className="w-8 h-8 flex items-center justify-center text-[#9195A6] hover:text-white transition rounded-lg hover:bg-[#161923]"
                >
                  🔍
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 flex items-center justify-center text-[#9195A6] hover:text-white transition rounded-lg hover:bg-[#161923] relative"
              >
                🔔
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-80 bg-[#14161D] border border-[#1B1E27] rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#1B1E27]">
                      <p className="font-medium text-white text-[13px] font-sans">Notifications</p>
                    </div>
                    <div className="px-4 py-7 text-center">
                      <p className="text-[#9195A6] text-[13px] font-sans">No notifications yet</p>
                      <p className="text-[#565C6E] text-[11px] mt-1 font-sans">We'll let you know when there's something new</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.main variants={containerVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto px-8 py-8">
          <motion.div variants={itemVariants} className="mb-7">
            <h1 className="text-[22px] font-semibold font-sans tracking-tight">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p className="text-[#9195A6] text-[13.5px] mt-0.5 font-sans">Your interview readiness snapshot for today</p>
          </motion.div>

          {/* Hero row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/readiness')}
              className="lg:col-span-2 bg-[#14161D] border border-[#1B1E27] rounded-2xl p-7 cursor-pointer flex flex-col sm:flex-row items-center gap-7 hover:border-[#2A2E3B] transition-colors"
            >
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 176, height: 176 }}>
                <ReadinessGauge score={readinessAnalyzed ? readinessScore : 0} active={!readinessLoading} size={176} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[9px] tracking-[0.18em] text-[#565C6E] font-sans uppercase">Readiness</span>
                  <span className="text-3xl font-semibold font-data mt-1.5 leading-none">
                    {readinessLoading ? (
                      <span className="text-[#565C6E]">—</span>
                    ) : readinessAnalyzed ? (
                      <>
                        <CountUp value={readinessScore} /><span className="text-sm text-[#565C6E]">%</span>
                      </>
                    ) : (
                      <span className="text-[#565C6E]">—</span>
                    )}
                  </span>
                  <span className="text-[11px] text-[#9195A6] mt-1.5 max-w-[140px] font-sans leading-tight">
                    {readinessLoading ? 'Reading signal…' : readinessAnalyzed ? getReadinessLabel(readinessScore) : 'Analyze your resume to activate'}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold font-sans text-[15px] mb-1">Readiness console</h3>
                <p className="text-[#9195A6] text-[13px] mb-4 leading-relaxed font-sans">
                  {readinessAnalyzed
                    ? 'Based on your last resume analysis. Re-run it any time your resume changes.'
                    : 'Upload your resume to calibrate your readiness score and unlock a full breakdown.'}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition px-4 py-2 rounded-lg font-sans">
                  {readinessAnalyzed ? 'Re-analyze resume' : 'Get your readiness score'} →
                </span>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Questions practiced', value: questionsPracticed, loading: progressLoading, sub: progress && progress.totalQuestionsAttempted > 0 ? 'Keep it up' : 'Start practicing', path: '/progress' },
                { label: 'Avg answer score', value: progress?.avgOverallScore, suffix: '/10', decimals: 1, loading: progressLoading, sub: progress && progress.totalQuestionsAttempted > 0 ? 'From recent attempts' : 'No attempts yet', path: '/answer-evaluator' },
                { label: 'Companies saved', value: companiesSaved, loading: false, sub: companiesSaved > 0 ? `${companiesSaved} bookmarked` : 'No companies saved yet', path: '/bookmarks' },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  onClick={() => navigate(m.path)}
                  className="flex-1 bg-[#14161D] border border-[#1B1E27] rounded-2xl px-5 py-4 cursor-pointer transition-colors hover:border-[#2A2E3B]"
                >
                  <p className="text-[#9195A6] text-[12px] mb-1.5 font-sans">{m.label}</p>
                  <p className="text-[26px] font-semibold font-data leading-none">
                    {m.loading ? (
                      <span className="text-[#565C6E]">···</span>
                    ) : (
                      <>
                        <CountUp value={m.value ?? 0} decimals={m.decimals || 0} />
                        {m.suffix && <span className="text-[13px] text-[#565C6E]">{m.suffix}</span>}
                      </>
                    )}
                  </p>
                  <p className="text-[11px] mt-1.5 text-[#565C6E] font-sans">{m.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Skill gap + readiness breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-[#14161D] border border-[#1B1E27] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold font-sans text-[14px]">Skill gap analysis</h3>
                <button onClick={() => navigate('/progress')} className="text-indigo-400 text-[12px] hover:underline font-sans">View full report</button>
              </div>
              {progressLoading ? (
                <p className="text-[#565C6E] text-[13px] font-sans">Reading signal…</p>
              ) : skills.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-[#9195A6] text-[13px] font-sans">No practice data yet</p>
                  <p className="text-[#565C6E] text-[12px] mt-1 font-sans">Attempt a mock interview or answer evaluator question to see your skill breakdown</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#9195A6] text-[12px] w-24 flex-shrink-0 truncate font-sans">{s.name}</span>
                      <div className="relative flex-1 bg-[#0B0D12] rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`${s.color} h-full rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="text-[#B7BECC] text-[11px] w-8 text-right font-data">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#14161D] border border-[#1B1E27] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold font-sans text-[14px]">Readiness breakdown</h3>
                <button onClick={() => navigate('/readiness')} className="text-indigo-400 text-[12px] hover:underline font-sans">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze resume'}
                </button>
              </div>

              {readinessLoading ? (
                <p className="text-[#565C6E] text-[13px] font-sans">Reading signal…</p>
              ) : !readinessAnalyzed ? (
                <div className="py-6 text-center">
                  <p className="text-[#9195A6] text-[13px] font-sans">You haven't analyzed your resume yet</p>
                  <button onClick={() => navigate('/readiness')} className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[12px] font-medium rounded-lg transition font-sans">
                    Get your readiness score
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {readinessBreakdown.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#9195A6] text-[12px] w-28 flex-shrink-0 truncate font-sans">{r.label}</span>
                      <div className="relative flex-1 bg-[#0B0D12] rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-indigo-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="text-[#B7BECC] text-[11px] w-8 text-right font-data">{r.pct}%</span>
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