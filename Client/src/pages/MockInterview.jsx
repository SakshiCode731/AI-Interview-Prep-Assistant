import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const MockInterview = () => {
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!jobRole) {
      setError('Please enter job role');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/mock-interview/questions', {
        jobRole,
        difficulty,
        numberOfQuestions
      });
      setQuestions(res.data.data.questions);
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
        <h2 className="text-3xl font-bold text-center mb-2">❓ Mock Interview</h2>
        <p className="text-gray-400 text-center mb-8">Practice with AI generated questions</p>

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
            <label className="text-sm text-gray-400 mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Number of Questions</label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-purple-400">
              Generated Questions:
            </h3>
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-gray-900 p-6 rounded-2xl border border-gray-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 font-semibold">Q{q.id}</span>
                  <span className="text-xs bg-gray-700 px-3 py-1 rounded-full">
                    {q.category}
                  </span>
                </div>
                <p className="text-white mb-3">{q.question}</p>
                <p className="text-gray-400 text-sm">💡 Hint: {q.hint}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;