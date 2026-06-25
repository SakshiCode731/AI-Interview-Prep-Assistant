import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const features = [
    { title: '📄 Resume Upload', desc: 'Upload your resume and extract text', path: '/resume' },
    { title: '🎯 Readiness Score', desc: 'Get AI powered readiness score', path: '/readiness' },
    { title: '❓ Mock Interview', desc: 'Practice with AI generated questions', path: '/mock-interview' },
    { title: '✅ Answer Evaluator', desc: 'Submit answers and get AI feedback', path: '/answer-evaluator' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-purple-400">PrepAI</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          Logout
        </button>
      </nav>

      {/* Main */}
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Welcome to PrepAI 👋</h2>
        <p className="text-gray-400 text-center mb-10">Your AI powered interview preparation platform</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-purple-500 cursor-pointer transition"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;