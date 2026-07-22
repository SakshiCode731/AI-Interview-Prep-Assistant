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

  // Interview flow state
  const [mode, setMode] = useState('form'); // 'form' | 'interview' | 'summary'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [answers, setAnswers] = useState([]); // { question, category, userAnswer, score, feedback, strengths, improvement }

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
      setAnswers([]);
      setCurrentIndex(0);
      setUserAnswer('');
      setMode('interview');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please write an answer before submitting');
      return;
    }
    setError('');
    setEvaluating(true);

    const currentQuestion = questions[currentIndex];

    try {
      const res = await API.post('/mock-interview/evaluate', {
        jobRole,
        question: currentQuestion.question,
        userAnswer
      });

      const evaluation = res.data.data;

      const newAnswerEntry = {
        question: currentQuestion.question,
        category: currentQuestion.category,
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvement: evaluation.improvement
      };

      const updatedAnswers = [...answers, newAnswerEntry];
      setAnswers(updatedAnswers);
      setUserAnswer('');

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setMode('summary');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handleStartOver = () => {
    setMode('form');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setJobRole('');
    setError('');
  };

  const averageScore =
    answers.length > 0
      ? (answers.reduce((sum, a) => sum + a.score, 0) / answers.length).toFixed(1)
      : 0;

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

      <div className="max-w-2xl mx-auto mt-12 px-4 pb-16">

        {/* ---------- FORM MODE ---------- */}
        {mode === 'form' && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">❓ Mock Interview</h2>
            <p className="text-gray-400 text-center mb-8">Practice with AI generated questions</p>

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
          </>
        )}

        {/* ---------- INTERVIEW MODE (one question at a time) ---------- */}
        {mode === 'interview' && questions.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-purple-400">
                Question {currentIndex + 1} of {questions.length}
              </h3>
              <span className="text-xs bg-gray-700 px-3 py-1 rounded-full">
                {questions[currentIndex].category}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-4">
              <p className="text-white text-lg mb-3">{questions[currentIndex].question}</p>
              <p className="text-gray-400 text-sm">💡 Hint: {questions[currentIndex].hint}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <label className="text-sm text-gray-400 mb-2 block">Your Answer</label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={6}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
              />

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating}
                className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
              >
                {evaluating ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}

        {/* ---------- SUMMARY MODE ---------- */}
        {mode === 'summary' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">🎉 Interview Complete!</h2>
              <p className="text-gray-400">Here's how you did</p>
              <div className="mt-6 inline-block bg-gray-900 border border-gray-800 rounded-2xl px-8 py-6">
                <p className="text-4xl font-bold text-purple-400">{averageScore}/10</p>
                <p className="text-gray-400 text-sm mt-1">Average Score across {answers.length} questions</p>
              </div>
            </div>

            <div className="space-y-4">
              {answers.map((a, i) => (
                <div key={i} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-purple-400 font-semibold">Q{i + 1}</span>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        a.score >= 7
                          ? 'bg-green-900/40 text-green-400'
                          : a.score >= 4
                          ? 'bg-yellow-900/40 text-yellow-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}
                    >
                      {a.score}/10
                    </span>
                  </div>
                  <p className="text-white mb-2">{a.question}</p>
                  <p className="text-gray-500 text-sm mb-3 italic">Your answer: {a.userAnswer}</p>
                  <p className="text-gray-300 text-sm mb-2">{a.feedback}</p>
                  <div className="flex gap-4 text-xs mt-2">
                    <p className="text-green-400">✅ {a.strengths}</p>
                    <p className="text-yellow-400">📈 {a.improvement}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartOver}
              className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
            >
              Start New Mock Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;