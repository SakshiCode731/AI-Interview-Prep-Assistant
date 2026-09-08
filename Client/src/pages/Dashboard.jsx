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
  Award
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
        { label: 'Skills match', pct: readiness.data.skillsMatch },
        { label: 'Experience', pct: readiness.data.experience },
        { label: 'Projects', pct: readiness.data.projects },
        { label: 'Resume quality', pct: readiness.data.resumeQuality },
      ]
    : [];

  const navItems = [
    { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', active: true }, { label: 'Progress tracker', icon: TrendingUp, path: '/progress' }] },
    { section: 'Preparation', items: [{ label: 'Company prep', icon: Building2, path: '/companies' }, { label: 'Resume upload', icon: FileText, path: '/resume' }, { label: 'Readiness score', icon: Target, path: '/readiness' }, { label: 'Skill gap analysis', icon: BarChart2, path: '/progress' }] },
    { section: 'Practice', items: [{ label: 'Mock interview', icon: HelpCircle, path: '/mock-interview', badge: 5 }, { label: 'Answer evaluator', icon: CheckCircle2, path: '/answer-evaluator' }, { label: 'System design', icon: Cpu, path: '/system-design' }, { label: 'AI chatbot', icon: Bot, path: '/chatbot' }, { label: 'AI Agent', icon: Sparkles, path: '/agent-chat' }] },
    { section: 'Guides', items: [{ label: 'Dressing guide', icon: Shirt, path: '/dressing-guide' }, { label: 'Confidence guide', icon: BrainCircuit, path: '/confidence-guide' }, { label: 'Behavior guide', icon: Users, path: '/behavior-guide' }] },
    { section: 'Account', items: [{ label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' }, { label: 'Settings', icon: Settings }] },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E2E8F0] flex font-sans antialiased selection:bg-indigo-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-data { font-family: 'JetBrains Mono', monospace; }
        
        /* Clean no-scrollbar layout */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-[#0E1017] border-r border-[#1E2230] flex flex-col flex-shrink-0 h-screen sticky top-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#1E2230] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="font-bold text-base tracking-tight text-white">PrepAI</span>
          <span className="ml-auto text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">PRO</span>
        </div>

        {/* Clean Sidebar Navigation */}
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

        {/* User Profile Footer */}
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

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-[#1E2230] px-8 flex items-center justify-between sticky top-0 bg-[#0A0B0E]/80 backdrop-blur-xl z-20">
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
                className="w-72 bg-[#12141D] border border-[#1E2230] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#525866] focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#12141D] border border-[#1E2230] text-[#8A8F9E] hover:text-white transition relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <motion.main variants={containerVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto no-scrollbar px-8 py-8 space-y-6">
          {/* Greeting Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {getGreeting()}, <span className="text-indigo-400">{user?.name?.split(' ')[0] || 'there'}</span> 👋
              </h1>
              <p className="text-xs text-[#8A8F9E] mt-1">Here is your active interview readiness & practice snapshot.</p>
            </div>
          </motion.div>

          {/* Hero Row Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Readiness Hero Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/readiness')}
              className="lg:col-span-2 bg-gradient-to-br from-[#12141D] via-[#10121A] to-[#0E0F16] border border-[#1E2230] hover:border-indigo-500/40 rounded-2xl p-6 cursor-pointer flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden transition-all group shadow-xl"
            >
              <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition" />

              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 160, height: 160 }}>
                <ReadinessGauge score={readinessAnalyzed ? readinessScore : 0} active={!readinessLoading} size={160} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#525866] uppercase">Score</span>
                  <span className="text-3xl font-extrabold font-data text-white mt-1">
                    {readinessLoading ? '···' : readinessAnalyzed ? <CountUp value={readinessScore} /> : '—'}
                    {readinessAnalyzed && <span className="text-xs text-indigo-400 ml-0.5">%</span>}
                  </span>
                  <span className="text-[10px] text-[#8A8F9E] mt-1 max-w-[110px] leading-tight">
                    {readinessLoading ? 'Loading…' : readinessAnalyzed ? getReadinessLabel(readinessScore) : 'Not calibrated'}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold tracking-wider uppercase mb-2 border border-indigo-500/20">
                  <Flame className="w-3 h-3 text-indigo-400" /> Readiness Console
                </span>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {readinessAnalyzed ? 'Resume Analyzed & Verified' : 'Calibrate Your Interview Score'}
                </h3>
                <p className="text-xs text-[#8A8F9E] mb-4 leading-relaxed">
                  {readinessAnalyzed
                    ? 'Your current score is calculated using your uploaded resume against real target profiles.'
                    : 'Upload your resume to calibrate your readiness score and receive personalized skill gap suggestions.'}
                </p>
                <button className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20">
                  {readinessAnalyzed ? 'Re-analyze resume' : 'Get readiness score'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Quick Metrics Stack */}
            <div className="space-y-3 flex flex-col justify-between">
              {[
                { label: 'Questions Practiced', value: questionsPracticed, loading: progressLoading, sub: progress && progress.totalQuestionsAttempted > 0 ? 'Keep building momentum' : 'Start practicing', path: '/progress', icon: Flame },
                { label: 'Avg Answer Score', value: progress?.avgOverallScore, suffix: '/10', decimals: 1, loading: progressLoading, sub: progress && progress.totalQuestionsAttempted > 0 ? 'Evaluated by AI' : 'No evaluation history', path: '/answer-evaluator', icon: Award },
                { label: 'Companies Bookmarked', value: companiesSaved, loading: false, sub: companiesSaved > 0 ? `${companiesSaved} targets saved` : 'Save companies for prep', path: '/bookmarks', icon: Bookmark },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    onClick={() => navigate(m.path)}
                    className="bg-[#12141D] border border-[#1E2230] hover:border-[#2B3044] rounded-2xl px-5 py-3.5 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-[11px] font-medium text-[#8A8F9E]">{m.label}</p>
                      <p className="text-xl font-bold font-data text-white mt-0.5">
                        {m.loading ? (
                          '···'
                        ) : (
                          <>
                            <CountUp value={m.value ?? 0} decimals={m.decimals || 0} />
                            {m.suffix && <span className="text-xs text-[#525866] font-normal">{m.suffix}</span>}
                          </>
                        )}
                      </p>
                      <p className="text-[10px] text-[#525866] mt-0.5">{m.sub}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#161926] border border-[#1E2230] flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Skill Gap & Readiness Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Skill Gap Analysis */}
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
                <div className="space-y-3.5">
                  {skills.map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A8F9E] font-medium">{s.name}</span>
                        <span className="text-white font-data font-semibold">{s.pct}%</span>
                      </div>
                      <div className="w-full bg-[#181B26] rounded-full h-2 overflow-hidden border border-[#1E2230]">
                        <motion.div
                          className={`bg-gradient-to-r ${s.color} h-full rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Readiness Breakdown */}
            <motion.div variants={itemVariants} className="bg-[#12141D] border border-[#1E2230] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Readiness breakdown</h3>
                  <p className="text-[11px] text-[#525866]">Resume match metrics</p>
                </div>
                <button onClick={() => navigate('/readiness')} className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                  {readinessAnalyzed ? 'Re-analyze' : 'Analyze'} <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {readinessLoading ? (
                <div className="py-8 text-center text-xs text-[#525866]">Calculating metrics...</div>
              ) : !readinessAnalyzed ? (
                <div className="py-8 text-center bg-[#161926]/40 rounded-xl border border-[#1E2230]">
                  <p className="text-xs text-[#8A8F9E] font-medium">Resume analysis required</p>
                  <button onClick={() => navigate('/readiness')} className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
                    Upload & Calculate
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {readinessBreakdown.map((r, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8A8F9E] font-medium">{r.label}</span>
                        <span className="text-white font-data font-semibold">{r.pct}%</span>
                      </div>
                      <div className="w-full bg-[#181B26] rounded-full h-2 overflow-hidden border border-[#1E2230]">
                        <motion.div
                          className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                        />
                      </div>
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