import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  FileText,
  Target,
  BarChart2,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Bot,
  Sparkles,
  Shirt,
  BrainCircuit,
  Users,
  Bookmark,
  Settings,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import API from '../services/api';

const statusToColor = {
  strong: 'from-emerald-500 to-teal-400',
  average: 'from-amber-500 to-yellow-400',
  weak: 'from-rose-500 to-red-400',
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
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
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
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [value, decimals, shouldReduceMotion]);

  if (typeof value !== 'number' || Number.isNaN(value)) return <>{value}</>;
  return <>{decimals ? display.toFixed(decimals) : Math.round(display)}</>;
};

const ReadinessGauge = ({ score = 0, active = true, size = 160 }) => {
  const shouldReduceMotion = useReducedMotion();
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1D26" strokeWidth={8} />
        {active && (
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </svg>
    </div>
  );
};

// Legend row used in the right-rail "Statistics" card — colored dot + label +
// percentage on top, a thin colored progress bar underneath (Fobework style).
const LegendBarRow = ({ label, pct, colorClass, dotClass, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 + index * 0.08 }}
    className="space-y-1"
  >
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        <span className="text-[#8A8F9E] font-medium">{label}</span>
      </div>
      <span className="text-white font-data font-semibold">{pct}%</span>
    </div>
    <div className="w-full bg-[#181B26] rounded-full h-1.5 overflow-hidden border border-[#1E2230]">
      <motion.div
        className={`${colorClass} h-full rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay: 0.35 + index * 0.08 }}
      />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [readiness, setReadiness] = useState(null);
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
      color: statusToColor[t.status] || 'from-indigo-500 to-indigo-400',
    }));

  const readinessBreakdown = readinessAnalyzed
    ? [
        { label: 'Skills match', pct: readiness.data.skillsMatch, colorClass: 'bg-gradient-to-r from-violet-500 to-purple-400', dotClass: 'bg-violet-400' },
        { label: 'Experience', pct: readiness.data.experience, colorClass: 'bg-gradient-to-r from-emerald-500 to-teal-400', dotClass: 'bg-emerald-400' },
        { label: 'Projects', pct: readiness.data.projects, colorClass: 'bg-gradient-to-r from-amber-500 to-yellow-400', dotClass: 'bg-amber-400' },
        { label: 'Resume quality', pct: readiness.data.resumeQuality, colorClass: 'bg-gradient-to-r from-sky-500 to-cyan-400', dotClass: 'bg-sky-400' },
      ]
    : [];

  const navItems = [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', active: true }, { label: 'Progress tracker', icon: TrendingUp, path: '/progress' }] },
    { section: 'Preparation', items: [{ label: 'Company prep', icon: Building2, path: '/companies' }, { label: 'Resume upload', icon: FileText, path: '/resume' }, { label: 'Readiness score', icon: Target, path: '/readiness' }, { label: 'Skill gap analysis', icon: BarChart2, path: '/progress' }] },
    { section: 'Practice', items: [{ label: 'Mock interview', icon: HelpCircle, path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: CheckCircle2, path: '/answer-evaluator' }, { label: 'System design', icon: Cpu, path: '/system-design' }, { label: 'AI chatbot', icon: Bot, path: '/chatbot' }, { label: 'AI Agent', icon: Sparkles, path: '/agent-chat' }] },
    { section: 'Guides', items: [{ label: 'Dressing guide', icon: Shirt, path: '/dressing-guide' }, { label: 'Confidence guide', icon: BrainCircuit, path: '/confidence-guide' }, { label: 'Behavior guide', icon: Users, path: '/behavior-guide' }] },
    { section: 'Account', items: [{ label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' }, { label: 'Settings', icon: Settings }] },
  ];

  const statPills = [
    { label: 'Readiness score', value: readinessAnalyzed ? readinessScore : null, loading: readinessLoading, suffix: readinessAnalyzed ? '%' : '', icon: Target, path: '/readiness', fallback: '—', sub: readinessAnalyzed ? 'Based on last analysis' : 'Analyze your resume' },
    { label: 'Questions practiced', value: questionsPracticed, loading: progressLoading, icon: Flame, path: '/progress', fallback: 0, sub: progress && progress.totalQuestionsAttempted > 0 ? 'Keep it up' : 'Start practicing' },
    { label: 'Avg answer score', value: progress?.avgOverallScore, decimals: 1, suffix: '/10', loading: progressLoading, icon: Award, path: '/answer-evaluator', fallback: '—', sub: progress && progress.totalQuestionsAttempted > 0 ? 'Recent attempts' : 'No attempts yet' },
    { label: 'Companies saved', value: companiesSaved, loading: false, icon: Bookmark, path: '/bookmarks', fallback: 0, sub: companiesSaved > 0 ? `${companiesSaved} bookmarked` : 'None saved yet' },
  ];

  const quickAccess = [
    { icon: HelpCircle, title: 'Mock interview', desc: 'Fresh questions, timed practice', color: 'from-indigo-600/30 to-indigo-500/5', iconColor: 'text-indigo-400', path: '/mock-interview' },
    { icon: CheckCircle2, title: 'Answer evaluator', desc: 'Instant AI-scored feedback', color: 'from-emerald-600/30 to-emerald-500/5', iconColor: 'text-emerald-400', path: '/answer-evaluator' },
    { icon: Cpu, title: 'System design', desc: 'Practice architecture rounds', color: 'from-sky-600/30 to-sky-500/5', iconColor: 'text-sky-400', path: '/system-design' },
    { icon: Bot, title: 'AI chatbot', desc: 'Ask anything, anytime', color: 'from-amber-600/30 to-amber-500/5', iconColor: 'text-amber-400', path: '/chatbot' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E2E8F0] flex font-sans antialiased selection:bg-indigo-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-data { font-family: 'JetBrains Mono', monospace; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-[#0E1017] border-r border-[#1E2230] flex flex-col flex-shrink-0 h-screen sticky top-0 z-30">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#1E2230] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="font-bold text-base tracking-tight text-white">PrepAI</span>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
          {navItems.map((group, gi) => (
            <div key={gi}>
              <p className="text-[10px] text-[#525866] uppercase font-bold tracking-widest mb-2 px-3">{group.section}</p>
              <div className="space-y-1">
                {group.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={ii}
                      onClick={() => item.path && navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                        item.active
                          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                          : 'text-[#8A8F9E] hover:text-white hover:bg-[#161926]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.active ? 'text-indigo-400' : 'text-[#646A7E]'}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-data font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#1E2230] p-3">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#161926] transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-[#525866] truncate">{user?.email}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 bottom-full mb-2 w-60 bg-[#12141D] border border-[#1E2230] rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="grid grid-cols-3 border-b border-[#1E2230] text-center py-2.5 bg-[#161926]/50 font-data">
                    <div>
                      <p className="text-xs font-bold text-white">{readinessLoading ? '···' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                      <p className="text-[9px] text-[#525866] font-sans">Readiness</p>
                    </div>
                    <div className="border-x border-[#1E2230]">
                      <p className="text-xs font-bold text-white">{progressLoading ? '···' : (questionsPracticed ?? 0)}</p>
                      <p className="text-[9px] text-[#525866] font-sans">Practiced</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{companiesSaved}</p>
                      <p className="text-[9px] text-[#525866] font-sans">Saved</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-1">
                    <button onClick={() => { setShowProfile(false); navigate('/resume'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8A8F9E] hover:bg-[#1A1D2B] hover:text-white rounded-xl transition text-left">
                      <FileText className="w-3.5 h-3.5" /> My Resume
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/readiness'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8A8F9E] hover:bg-[#1A1D2B] hover:text-white rounded-xl transition text-left">
                      <Target className="w-3.5 h-3.5" /> Readiness Score
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left font-medium">
                      <LogOut className="w-3.5 h-3.5" /> Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {showProfile && <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />}
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — breadcrumb style, matches reference */}
        <header className="h-16 border-b border-[#1E2230] px-8 flex items-center justify-between sticky top-0 bg-[#0A0B0E]/80 backdrop-blur-xl z-20">
          <p className="text-xs text-[#8A8F9E] hidden md:block">
            Dashboard <span className="text-[#3A3F4E]">/</span> <span className="text-white font-medium">Overview</span>
          </p>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#525866]" />
              <input
                type="text"
                placeholder="Search companies, topics, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="w-64 bg-[#12141D] border border-[#1E2230] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#525866] focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-[#12141D] border border-[#1E2230] text-[#8A8F9E] hover:text-white transition relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-80 bg-[#12141D] border border-[#1E2230] rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#1E2230]">
                      <p className="font-medium text-white text-[13px]">Notifications</p>
                    </div>
                    <div className="px-4 py-7 text-center">
                      <p className="text-[#8A8F9E] text-[13px]">No notifications yet</p>
                      <p className="text-[#525866] text-[11px] mt-1">We'll let you know when there's something new</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
            </div>
          </div>
        </header>

        {/* Body: main content + right rail (Fobework layout) */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto no-scrollbar px-8 py-8 flex flex-col xl:flex-row gap-6"
        >
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {getGreeting()}, <span className="text-indigo-400">{user?.name?.split(' ')[0] || 'there'}</span> 👋
              </h1>
              <p className="text-xs text-[#8A8F9E] mt-1">Here is your active interview readiness & practice snapshot.</p>
            </motion.div>

            {/* Stat pills — "My school stats" equivalent */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statPills.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    onClick={() => s.path && navigate(s.path)}
                    whileHover={{ y: -3 }}
                    className="bg-[#12141D] border border-[#1E2230] hover:border-indigo-500/40 rounded-2xl p-4 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#161926] border border-[#1E2230] flex items-center justify-center text-indigo-400 mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold font-data text-white leading-none">
                      {s.loading ? (
                        '···'
                      ) : s.value === null || s.value === undefined ? (
                        s.fallback
                      ) : (
                        <>
                          <CountUp value={s.value} decimals={s.decimals || 0} />
                          {s.suffix && <span className="text-xs text-[#525866] font-normal">{s.suffix}</span>}
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-[#8A8F9E] mt-1.5">{s.label}</p>
                    {s.sub && <p className="text-[10px] text-[#525866] mt-1">{s.sub}</p>}
                  </motion.div>
                );
              })}
            </div>

            {/* CTA banner — "Career Guide tools" equivalent */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-indigo-600/15 via-[#12141D] to-[#12141D] border border-[#1E2230] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  {readinessAnalyzed ? <BarChart2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">
                    {readinessAnalyzed ? 'Your resume has been analyzed' : 'Unlock your full readiness breakdown'}
                  </p>
                  <p className="text-xs text-[#8A8F9E] mt-0.5">
                    {readinessAnalyzed ? 'Revisit or re-run the analysis anytime for updated results.' : 'Upload and analyze your resume to see a personalized readiness score.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/readiness')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex-shrink-0 flex items-center gap-1.5"
              >
                {readinessAnalyzed ? 'Re-analyze' : 'Go to Readiness'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Quick access — "My Enrolment" equivalent */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">Quick access</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickAccess.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      onClick={() => navigate(q.path)}
                      whileHover={{ y: -4 }}
                      className="bg-[#12141D] border border-[#1E2230] hover:border-[#2B3044] rounded-2xl overflow-hidden cursor-pointer transition"
                    >
                      <div className={`h-16 flex items-center justify-center bg-gradient-to-br ${q.color}`}>
                        <Icon className={`w-6 h-6 ${q.iconColor}`} />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-white">{q.title}</p>
                        <p className="text-[11px] text-[#8A8F9E] mt-1">{q.desc}</p>
                        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${q.iconColor}`}>
                          Open <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Skill gap — "Assignments" list equivalent */}
            <motion.div variants={itemVariants} className="bg-[#12141D] border border-[#1E2230] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Skill gap analysis</h3>
                  <p className="text-[11px] text-[#525866]">Performance breakdown across topics</p>
                </div>
                <button onClick={() => navigate('/progress')} className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                  View report <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {progressLoading ? (
                <div className="py-8 text-center text-xs text-[#525866]">Loading skills data...</div>
              ) : skills.length === 0 ? (
                <div className="py-8 text-center bg-[#161926]/40 rounded-xl border border-[#1E2230]">
                  <p className="text-xs text-[#8A8F9E] font-medium">No practice history available</p>
                  <p className="text-[11px] text-[#525866] mt-1">Complete mock tests to build your skill profile</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {skills.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="flex items-center gap-3 py-2.5 border-b border-[#1E2230] last:border-b-0"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} bg-opacity-20 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-[#8A8F9E] font-medium w-28 flex-shrink-0 truncate">{s.name}</span>
                      <div className="flex-1 bg-[#181B26] rounded-full h-1.5 overflow-hidden border border-[#1E2230]">
                        <motion.div
                          className={`bg-gradient-to-r ${s.color} h-full rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.08 }}
                        />
                      </div>
                      <span className="text-xs text-white font-data font-semibold w-10 text-right flex-shrink-0">{s.pct}%</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right rail — "Student Profile" + "Statistics" equivalent */}
          <aside className="w-full xl:w-[300px] flex-shrink-0 space-y-6">
            {/* Profile card */}
            <motion.div variants={itemVariants} className="bg-[#12141D] border border-[#1E2230] rounded-2xl p-5 text-center">
              <p className="text-xs font-bold text-white mb-4 text-left">Your profile</p>
              <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <p className="text-sm font-semibold text-white mt-3">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#525866]">{user?.email}</p>

              <div className="grid grid-cols-3 mt-5 pt-4 border-t border-[#1E2230] font-data">
                <div>
                  <p className="text-sm font-bold text-white">{readinessLoading ? '···' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                  <p className="text-[9px] text-[#525866] font-sans mt-0.5">Readiness</p>
                </div>
                <div className="border-x border-[#1E2230]">
                  <p className="text-sm font-bold text-white">{progressLoading ? '···' : (questionsPracticed ?? 0)}</p>
                  <p className="text-[9px] text-[#525866] font-sans mt-0.5">Practiced</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{companiesSaved}</p>
                  <p className="text-[9px] text-[#525866] font-sans mt-0.5">Saved</p>
                </div>
              </div>
            </motion.div>

            {/* Statistics / readiness donut card */}
            <motion.div variants={itemVariants} className="bg-[#12141D] border border-[#1E2230] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Readiness breakdown</h3>
                <button onClick={() => navigate('/readiness')} className="text-xs text-indigo-400 hover:underline font-semibold">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze'}
                </button>
              </div>

              {readinessLoading ? (
                <div className="py-8 text-center text-xs text-[#525866]">Calculating metrics...</div>
              ) : !readinessAnalyzed ? (
                <div className="py-4 text-center">
                  <ReadinessGauge score={0} active={false} size={128} />
                  <p className="text-xs text-[#8A8F9E] font-medium mt-4">Resume analysis required</p>
                  <button
                    onClick={() => navigate('/readiness')}
                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Upload & Calculate
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-center py-2">
                    <ReadinessGauge score={readinessScore} active={true} size={128} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold font-data text-white">
                        <CountUp value={readinessScore} /><span className="text-xs text-indigo-400 ml-0.5">%</span>
                      </span>
                      <span className="text-[10px] text-[#8A8F9E] mt-1">{getReadinessLabel(readinessScore)}</span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3.5">
                    {readinessBreakdown.map((r, i) => (
                      <LegendBarRow key={i} label={r.label} pct={r.pct} colorClass={r.colorClass} dotClass={r.dotClass} index={i} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </aside>
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;