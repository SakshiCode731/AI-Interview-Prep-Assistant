import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AnswerEvaluator = () => {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!question || !userAnswer || !jobRole) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/answer/evaluate', {
        question,
        userAnswer,
        jobRole
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'Excellent') return 'text-green-400';
    if (verdict === 'Good') return 'text-blue-400';
    if (verdict === 'Average') return 'text-yellow-400';
    return 'text-red-400';
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
        <h2 className="text-3xl font-bold text-center mb-2">✅ Answer Evaluator</h2>
        <p className="text-gray-400 text-center mb-8">Submit your answer and get AI feedback</p>

        {/* Form */}
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
            <label className="text-sm text-gray-400 mb-1 block">Interview Question</label>
            <textarea
              placeholder="Enter the interview question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Your Answer</label>
            <textarea
              placeholder="Write your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Evaluating...' : 'Evaluate Answer'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mt-6 space-y-4">

            {/* Score + Verdict */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p className="text-5xl font-bold text-purple-400">{result.score}<span className="text-2xl">/10</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Verdict</p>
                <p className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>
                  {result.verdict}
                </p>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-gray-300 text-sm">{result.feedback}</p>
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

            {/* Ideal Answer */}
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">💡 Ideal Answer</h3>
              <p className="text-gray-300 text-sm bg-gray-800 p-4 rounded-xl">
                {result.idealAnswer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerEvaluator;