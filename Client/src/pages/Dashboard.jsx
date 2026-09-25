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
  Flag,
  Pencil,
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

// Circular gauge used in the right-rail "Readiness breakdown" card.
const ReadinessGauge = ({ score = 0, active = true, size = 168, icon: Icon = Target }) => {
  const shouldReduceMotion = useReducedMotion();
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF0FA" strokeWidth={10} />
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
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </svg>
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// Legend row used in the right-rail "Readiness breakdown" card — colored dot
// + label + percentage on top, a thin colored progress bar underneath.
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
        <span className="text-slate-500 font-medium">{label}</span>
      </div>
      <span className="text-slate-800 font-semibold">{pct}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
    { label: 'Readiness score', value: readinessAnalyzed ? readinessScore : null, loading: readinessLoading, suffix: readinessAnalyzed ? '%' : '', icon: Target, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', path: '/readiness', fallback: '—', sub: readinessAnalyzed ? 'Based on last analysis' : null, cta: !readinessAnalyzed ? 'Analyze your resume' : null },
    { label: 'Questions practiced', value: questionsPracticed, loading: progressLoading, icon: Flame, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', path: '/progress', fallback: 0, sub: 'Keep it up', badge: progress && progress.totalQuestionsAttempted > 0 ? '+4 this week' : null },
    { label: 'Avg answer score', value: progress?.avgOverallScore, decimals: 1, suffix: '/10', loading: progressLoading, icon: Award, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', path: '/answer-evaluator', fallback: '—', sub: progress && progress.totalQuestionsAttempted > 0 ? 'Recent attempts' : 'No attempts yet' },
    { label: 'Companies saved', value: companiesSaved, loading: false, icon: Bookmark, iconBg: 'bg-sky-50', iconColor: 'text-sky-500', path: '/bookmarks', fallback: 0, sub: companiesSaved > 0 ? `${companiesSaved} bookmarked` : 'None saved yet' },
  ];

  const quickAccess = [
    { icon: HelpCircle, title: 'Mock interview', desc: 'Fresh questions, timed practice', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', path: '/mock-interview', linkColor: 'text-indigo-500' },
    { icon: CheckCircle2, title: 'Answer evaluator', desc: 'Instant AI-scored feedback', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', path: '/answer-evaluator', linkColor: 'text-emerald-500' },
    { icon: Cpu, title: 'System design', desc: 'Practice architecture rounds', iconBg: 'bg-violet-50', iconColor: 'text-violet-500', path: '/system-design', linkColor: 'text-violet-500' },
    { icon: Bot, title: 'AI chatbot', desc: 'Ask anything, anytime', iconBg: 'bg-sky-50', iconColor: 'text-sky-500', path: '/chatbot', linkColor: 'text-sky-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F8FC] to-[#EEF0FA] text-slate-800 flex font-sans antialiased selection:bg-indigo-200/50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 h-screen sticky top-0 z-30">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">Prep AI</span>
          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md tracking-wider">PRO</span>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
          {navItems.map((group, gi) => (
            <div key={gi}>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2 px-3">{group.section}</p>
              <div className="space-y-1">
                {group.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={ii}
                      onClick={() => item.path && navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                        item.active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.active ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
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

        <div className="border-t border-slate-100 p-3">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition text-left"
            >
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 bottom-full mb-2 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="grid grid-cols-3 border-b border-slate-100 text-center py-2.5 bg-slate-50/60">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{readinessLoading ? '···' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                      <p className="text-[9px] text-slate-400">Readiness</p>
                    </div>
                    <div className="border-x border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{progressLoading ? '···' : (questionsPracticed ?? 0)}</p>
                      <p className="text-[9px] text-slate-400">Practiced</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{companiesSaved}</p>
                      <p className="text-[9px] text-slate-400">Saved</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-1">
                    <button onClick={() => { setShowProfile(false); navigate('/resume'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition text-left">
                      <FileText className="w-3.5 h-3.5" /> My Resume
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/readiness'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition text-left">
                      <Target className="w-3.5 h-3.5" /> Readiness Score
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 rounded-xl transition text-left font-medium">
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
        {/* Top bar */}
        <header className="h-16 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-xl z-20">
          <p className="text-xs text-slate-400 hidden md:block">
            Dashboard <span className="text-slate-300">/</span> <span className="text-slate-700 font-semibold">Overview</span>
          </p>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                className="w-64 bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:bg-white transition"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-900 transition relative"
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
                    className="absolute right-0 top-11 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 text-[13px]">Notifications</p>
                    </div>
                    <div className="px-4 py-7 text-center">
                      <p className="text-slate-500 text-[13px]">No notifications yet</p>
                      <p className="text-slate-400 text-[11px] mt-1">We'll let you know when there's something new</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
            </div>

            <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Body: main content + right rail */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto no-scrollbar px-8 py-8 flex flex-col xl:flex-row gap-6"
        >
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            <motion.div variants={itemVariants}>
              <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'there'}</span> 👋
              </h1>
              <p className="text-[13px] text-slate-500 mt-1">Here is your active interview readiness & practice snapshot.</p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statPills.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    onClick={() => s.path && navigate(s.path)}
                    whileHover={{ y: -3 }}
                    className="bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-4 cursor-pointer transition-colors shadow-sm shadow-slate-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[13px] text-slate-500 font-medium">{s.label}</p>
                      <div className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center ${s.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[26px] font-extrabold text-slate-900 leading-none">
                      {s.loading ? (
                        '···'
                      ) : s.value === null || s.value === undefined ? (
                        s.fallback
                      ) : (
                        <>
                          <CountUp value={s.value} decimals={s.decimals || 0} />
                          {s.suffix && <span className="text-sm text-slate-400 font-semibold">{s.suffix}</span>}
                        </>
                      )}
                    </p>
                    {s.badge && (
                      <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {s.badge}
                      </span>
                    )}
                    {s.cta ? (
                      <p className="text-[11px] text-indigo-500 font-semibold mt-2">{s.cta}</p>
                    ) : (
                      s.sub && <p className="text-[11px] text-slate-400 mt-2">{s.sub}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* CTA banner */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap shadow-lg shadow-indigo-200"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                  {readinessAnalyzed ? <BarChart2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-[15px] text-white">
                    {readinessAnalyzed ? 'Your resume has been analyzed' : 'Unlock your full readiness breakdown'}
                  </p>
                  <p className="text-xs text-indigo-100 mt-1">
                    {readinessAnalyzed ? 'Revisit or re-run the analysis anytime for updated results.' : 'Upload and analyze your resume to see a personalized readiness score.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/readiness')}
                className="relative z-10 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 text-indigo-600 transition flex-shrink-0 flex items-center gap-1.5"
              >
                {readinessAnalyzed ? 'Re-analyze' : 'Go to Readiness'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Quick access */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Quick access</h3>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 4 modules available
                </span>
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
                      className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-5 cursor-pointer transition shadow-sm shadow-slate-100"
                    >
                      <div className={`w-11 h-11 rounded-xl ${q.iconBg} flex items-center justify-center ${q.iconColor} mb-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-[14px] font-bold text-slate-900">{q.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{q.desc}</p>
                      <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${q.linkColor}`}>
                        Open <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Skill gap analysis */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Skill gap analysis</h3>
                  <p className="text-[11px] text-slate-400">Performance breakdown across topics</p>
                </div>
                <button onClick={() => navigate('/progress')} className="text-xs text-indigo-500 hover:underline font-semibold flex items-center gap-1">
                  View report <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {progressLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading skills data...</div>
              ) : skills.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">No practice history available</p>
                  <p className="text-[11px] text-slate-400 mt-1">Complete mock tests to build your skill profile</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {skills.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-b-0"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} bg-opacity-15 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-600 font-medium w-28 flex-shrink-0 truncate">{s.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`bg-gradient-to-r ${s.color} h-full rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.08 }}
                        />
                      </div>
                      <span className="text-xs text-slate-700 font-bold w-10 text-right flex-shrink-0">{s.pct}%</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right rail */}
          <aside className="w-full xl:w-[300px] flex-shrink-0 space-y-6">
            {/* Profile card */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm shadow-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-800 text-left">Your profile</p>
                <button className="text-slate-300 hover:text-slate-500 transition">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative w-16 h-16 rounded-full mx-auto mt-2 bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-3">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                <Award className="w-3 h-3" /> PrepAI Pro Candidate
              </span>

              <div className="grid grid-cols-3 mt-5 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{readinessLoading ? '···' : (readinessAnalyzed ? `${readinessScore}%` : '—')}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Readiness</p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{progressLoading ? '···' : (questionsPracticed ?? 0)}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Practiced</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{companiesSaved}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Saved</p>
                </div>
              </div>
            </motion.div>

            {/* Readiness breakdown / gauge card */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Readiness breakdown</h3>
                <button onClick={() => navigate('/readiness')} className="text-xs text-indigo-500 hover:underline font-semibold">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze'}
                </button>
              </div>

              {readinessLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Calculating metrics...</div>
              ) : !readinessAnalyzed ? (
                <div className="py-2 text-center">
                  <div className="relative flex items-center justify-center py-2">
                    <ReadinessGauge score={0} active={false} size={140} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] tracking-widest text-slate-300 font-bold mt-14">SCORE</span>
                      <span className="text-lg font-extrabold text-slate-300 mt-0.5">—</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-3 max-w-[200px] mx-auto leading-snug">
                    Resume analysis required to benchmark your interview readiness.
                  </p>
                  <button
                    onClick={() => navigate('/readiness')}
                    className="mt-4 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    Upload & Calculate
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-center py-2">
                    <ReadinessGauge score={readinessScore} active={true} size={140} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-slate-900">
                        <CountUp value={readinessScore} /><span className="text-xs text-indigo-500 ml-0.5">%</span>
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{getReadinessLabel(readinessScore)}</span>
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

            {/* Target role card */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm shadow-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">Target Role: Senior Frontend</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Goal: 85% Readiness by Oct 30</p>
              </div>
              <button className="text-slate-300 hover:text-indigo-500 transition flex-shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </aside>
        </motion.main>
      </div>
    </div>
  );
};

export default Dashboard;