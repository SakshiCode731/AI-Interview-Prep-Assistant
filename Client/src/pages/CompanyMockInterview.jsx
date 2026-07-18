import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import useSpeechToText from '../hooks/useSpeechToText';

const CompanyMockInterview = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { isListening, transcript, error: voiceError, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const fetchCompany = async () => {
    try {
      const res = await API.get(`/companies/${companyId}`);
      setCompany(res.data);
    } catch (err) {
      setError('Could not load company data');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = company?.questions?.[currentIndex];
  const totalQuestions = company?.questions?.length || 0;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please write an answer before submitting');
      return;
    }
    setError('');
    setEvaluating(true);
    try {
      const res = await API.post('/answer/evaluate', {
        question: currentQuestion.question,
        userAnswer: answer,
        jobRole: `${company.name} — ${currentQuestion.round}`,
      });
      const evalResult = res.data.data;

      setResults((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          round: currentQuestion.round,
          difficulty: currentQuestion.difficulty,
          userAnswer: answer,
          score: evalResult.score,
          verdict: evalResult.verdict,
          feedback: evalResult.feedback,
          clarityScore: evalResult.clarityScore,
          starAdherence: evalResult.starAdherence,
          keywordCoverage: evalResult.keywordCoverage,
          confidenceIndicators: evalResult.confidenceIndicators,
        },
      ]);

      setAnswer('');
      resetTranscript();
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionComplete(true);
      }
    } catch (err) {
      setError('Could not evaluate answer. Try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSkip = () => {
    setResults((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        round: currentQuestion.round,
        difficulty: currentQuestion.difficulty,
        userAnswer: '(Skipped)',
        score: 0,
        verdict: 'Skipped',
        feedback: 'You skipped this question.',
      },
    ]);
    setAnswer('');
    resetTranscript();
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const avgScore = results.length
    ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(1)
    : 0;

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'text-green-400 bg-green-900/30 border-green-800';
    if (d === 'Medium') return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading interview session...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">Company not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-purple-400">PrepAI</span>
        <button
          onClick={() => navigate('/companies')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Exit Interview
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {!sessionComplete ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">🎯 {company.name} Mock Interview</h2>
              <p className="text-gray-400 text-sm">Question {currentIndex + 1} of {totalQuestions}</p>
              {/* Progress bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full border ${difficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                  {currentQuestion.round}
                </span>
              </div>
              <p className="text-white text-lg leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Answer Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">Your Answer</label>
                {isSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        resetTranscript();
                        startListening();
                      }
                    }}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition ${
                      isListening
                        ? 'bg-red-900/40 border-red-700 text-red-400'
                        : 'bg-purple-900/30 border-purple-700 text-purple-300 hover:bg-purple-900/50'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Listening... Tap to stop
                      </>
                    ) : (
                      <>🎤 Speak your answer</>
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Type your answer, or use the mic to speak as you would in a real interview..."
                className={`w-full px-4 py-3 rounded-xl bg-gray-800 text-white border focus:outline-none resize-none transition ${
                  isListening ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-700 focus:border-purple-500'
                }`}
              />
              {voiceError && <p className="text-yellow-400 text-xs mt-1">{voiceError}</p>}
              {!isSupported && (
                <p className="text-gray-500 text-xs mt-1">Voice input works best in Chrome or Edge</p>
              )}

              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSkip}
                  disabled={evaluating}
                  className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={evaluating}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
                >
                  {evaluating ? 'Evaluating...' : currentIndex + 1 === totalQuestions ? 'Submit & Finish' : 'Submit & Next →'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Session Summary */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">🎉 Interview Session Complete</h2>
              <p className="text-gray-400">{company.name} — {totalQuestions} questions answered</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Average Score</p>
              <p className="text-5xl font-bold text-purple-400">{avgScore}<span className="text-xl">/10</span></p>
            </div>

            <div className="space-y-4">
              {results.map((r, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(r.difficulty)}`}>
                      {r.difficulty}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{r.round}</span>
                    <span className="ml-auto text-sm font-semibold text-purple-400">{r.score}/10</span>
                  </div>
                  <p className="text-white text-sm mb-2">{r.question}</p>
                  <p className="text-gray-500 text-xs mb-2">Your answer: {r.userAnswer}</p>
                  <p className="text-gray-400 text-xs bg-gray-800 rounded-lg p-3">{r.feedback}</p>
                  {r.clarityScore !== undefined && (
                    <p className="text-xs text-blue-400 mt-2">Clarity: {r.clarityScore}/10 · Confidence: {r.confidenceIndicators?.level}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate('/companies')}
                className="flex-1 py-3 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition"
              >
                Back to Companies
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setResults([]);
                  setSessionComplete(false);
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Retry Interview
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CompanyMockInterview;