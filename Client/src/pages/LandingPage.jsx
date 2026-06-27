import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🏢', title: 'Company-wise Prep', desc: 'TCS, Infosys, Amazon — rounds, questions, required skills sab ek jagah' },
  { icon: '📄', title: 'Resume Analysis', desc: 'PDF upload karo, AI tumhara resume analyze karega aur score dega' },
  { icon: '🎯', title: 'Readiness Score', desc: 'Janlo tum kitne % ready ho apni dream company ke liye' },
  { icon: '❓', title: 'Mock Interview', desc: 'AI se practice karo — real interview jaisi questions milenge' },
  { icon: '✅', title: 'Answer Evaluator', desc: 'Apna answer submit karo, AI score aur feedback dega' },
  { icon: '🤖', title: 'AI Chatbot', desc: '24/7 AI mentor — koi bhi interview question poocho' },
  { icon: '👔', title: 'Dressing Guide', desc: 'Interview ke liye kya pehne — male aur female dono ke liye' },
  { icon: '🧘', title: 'Confidence Guide', desc: 'Interview anxiety door karo — breathing, mindset, body language' },
];

const stats = [
  { value: '10,000+', label: 'Students helped' },
  { value: '500+', label: 'Companies covered' },
  { value: '95%', label: 'Success rate' },
  { value: '24/7', label: 'AI support' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-950 border-b border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-purple-400">PrepAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-xl transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition font-semibold"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-purple-900/40 border border-purple-700 text-purple-300 text-xs px-4 py-1.5 rounded-full mb-6">
          AI-Powered Interview Preparation Platform
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Crack Your Dream Interview<br />
          <span className="text-purple-400">With AI Guidance</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          From resume analysis to mock interviews — PrepAI gives you everything you need to walk into any interview with confidence.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-base transition"
          >
            Start Preparing Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-base transition"
          >
            Login to account
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 py-12 bg-gray-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-purple-400 mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Everything You Need to Succeed</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          8 powerful AI features designed specifically for engineering students preparing for placements
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 hover:border-purple-600 rounded-2xl p-6 transition cursor-pointer group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How PrepAI Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload your resume', desc: 'AI analyzes your resume and calculates your readiness score' },
              { step: '02', title: 'Choose your company', desc: 'Select your target company and see exactly what they look for' },
              { step: '03', title: 'Practice and improve', desc: 'Mock interviews, AI feedback, guides — all in one place' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-purple-800 mb-4">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to crack your interview?</h2>
        <p className="text-gray-400 mb-8 text-lg">Join 10,000+ students who are already preparing smarter with PrepAI</p>
        <button
          onClick={() => navigate('/register')}
          className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-lg transition"
        >
          Get Started — It's Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <div className="text-purple-400 font-semibold mb-2">PrepAI</div>
        Built for engineering students. Powered by AI.
      </footer>

    </div>
  );
};

export default LandingPage;