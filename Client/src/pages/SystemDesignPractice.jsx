import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const SystemDesignPractice = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [design, setDesign] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await API.get('/system-design/questions');
      setQuestions(res.data);
    } catch (err) {
      setError('Could not load system design questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (q) => {
    setSelected(q);
    setDesign('');
    setResult(null);
    setError('');
  };

  const handleEvaluate = async () => {
    if (!design.trim()) {
      setError('Please write your design approach before submitting');
      return;
    }
    setError('');
    setEvaluating(true);
    try {
      const res = await API.post('/system-design/evaluate', {
        question: selected.title,
        userDesign: design,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Evaluation failed. Try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'text-green-400 bg-green-900/30 border-green-800';
    if (d === 'Medium') return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
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
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-purple-400">PrepAI</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">🏗️ System Design Practice</h2>
        <p className="text-gray-400 mb-8">Practice high-level design thinking — important for product-based companies like Amazon</p>

        {loading ? (
          <p className="text-gray-400">Loading questions...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Question List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">{questions.length} Questions</h3>
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`bg-gray-900 border rounded-2xl p-4 cursor-pointer transition ${
                    selected?.id === q.id ? 'border-purple-500 bg-purple-900/10' : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white text-sm">{q.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ml-2 ${difficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{q.hint}</p>
                </div>
              ))}
            </div>

            {/* Design Area */}
            <div className="lg:col-span-2">
              {!selected ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-xl font-semibold mb-2">Select a question</h3>
                  <p className="text-gray-400">Pick a system design problem from the left to start practicing</p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Question Card */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full border ${difficultyColor(selected.difficulty)}`}>
                        {selected.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{selected.title}</h3>
                    <p className="text-gray-400 text-sm">💡 {selected.hint}</p>
                  </div>

                  {/* Design Input */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Your Approach — cover requirements, components, data flow, and trade-offs
                    </label>
                    <textarea
                      value={design}
                      onChange={(e) => setDesign(e.target.value)}
                      rows={10}
                      placeholder="E.g. First I'd clarify requirements — expected scale, read/write ratio. Then I'd design the components: API layer, hashing service, database schema... For scalability I'd consider..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none text-sm"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button
                      onClick={handleEvaluate}
                      disabled={evaluating}
                      className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
                    >
                      {evaluating ? 'Evaluating...' : 'Evaluate My Design'}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">

                      {/* Score + Verdict */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400 text-sm">Score</p>
                          <p className="text-5xl font-bold text-purple-400">{result.score}<span className="text-2xl">/10</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Verdict</p>
                          <p className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>{result.verdict}</p>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-xl">
                        <p className="text-gray-300 text-sm">{result.feedback}</p>
                      </div>

                      {/* Requirements Clarity */}
                      <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">📋 Requirements Clarification</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${result.requirementsClarity?.addressed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {result.requirementsClarity?.addressed ? 'Addressed' : 'Missed'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{result.requirementsClarity?.note}</p>
                      </div>

                      {/* Components */}
                      <div className="bg-gray-800 rounded-xl p-4">
                        <span className="text-sm font-semibold text-white mb-2 block">🧩 Components</span>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {result.componentsIdentified?.map((c, i) => (
                            <span key={`ci-${i}`} className="text-xs bg-green-900/30 border border-green-800 text-green-400 px-2 py-1 rounded-full">✓ {c}</span>
                          ))}
                          {result.missingComponents?.map((c, i) => (
                            <span key={`mi-${i}`} className="text-xs bg-gray-900 border border-gray-700 text-gray-500 px-2 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Scalability */}
                      <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-white">📈 Scalability Thinking</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.scalabilityThinking?.level === 'High' ? 'bg-green-900/30 text-green-400' :
                            result.scalabilityThinking?.level === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {result.scalabilityThinking?.level}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{result.scalabilityThinking?.note}</p>
                      </div>

                      {/* Trade-offs */}
                      {result.tradeOffsDiscussed?.length > 0 && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <span className="text-sm font-semibold text-white mb-2 block">⚖️ Trade-offs Discussed</span>
                          <div className="flex flex-wrap gap-2">
                            {result.tradeOffsDiscussed.map((t, i) => (
                              <span key={i} className="text-xs bg-blue-900/30 border border-blue-800 text-blue-300 px-2 py-1 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths / Improvements */}
                      <div>
                        <h3 className="text-green-400 font-semibold mb-2">✅ Strengths</h3>
                        <ul className="space-y-1">
                          {result.strengths?.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-red-400 font-semibold mb-2">⚠️ Improvements</h3>
                        <ul className="space-y-1">
                          {result.improvements?.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}
                        </ul>
                      </div>

                      {/* Ideal Approach */}
                      <div>
                        <h3 className="text-blue-400 font-semibold mb-2">💡 Ideal Approach Summary</h3>
                        <p className="text-gray-300 text-sm bg-gray-800 p-4 rounded-xl leading-relaxed">{result.idealApproachSummary}</p>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDesignPractice;