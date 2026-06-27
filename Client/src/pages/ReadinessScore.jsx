import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ReadinessScore = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!resumeText || !jobRole) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/readiness/score', { resumeText, jobRole });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-purple-400">PrepAI</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-2">🎯 Readiness Score</h2>
        <p className="text-gray-400 text-center mb-8">Get AI powered interview readiness score</p>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Job Role</label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Paste your Resume Text</label>
            <textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Analyzing...' : 'Get Readiness Score'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mt-6 space-y-4">
            
            {/* Score */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Your Readiness Score</p>
              <p className="text-6xl font-bold text-purple-400">{result.score}%</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-gray-300 text-sm">{result.summary}</p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-green-400 font-semibold mb-2">✅ Strengths</h3>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {s}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h3 className="text-red-400 font-semibold mb-2">⚠️ Improvements</h3>
              <ul className="space-y-1">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {imp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadinessScore;