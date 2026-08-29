import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAgentMessage, listAgentSessions, getAgentSession } from '../services/agentService';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your AI Interview Agent 🤖 Ask me to generate practice questions, or paste an answer and I'll evaluate it for you!"
};

const MAX_INPUT_LENGTH = 4000;

const getErrorMessage = (err) => {
  if (!err.response) {
    return '⚠️ Cannot reach the server. Please check your connection and try again.';
  }
  const status = err.response.status;
  if (status === 429) {
    return '⚠️ Too many requests. Please wait a moment before trying again.';
  }
  if (status === 401) {
    return '⚠️ Your session has expired. Please log in again.';
  }
  if (status >= 500) {
    return '⚠️ Our AI service is having trouble right now. Please try again in a moment.';
  }
  if (err.response.data?.error) {
    return `⚠️ ${err.response.data.error}`;
  }
  return '⚠️ Something went wrong. Please try again.';
};

const AgentChat = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  // Sidebar state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionLoadingId, setSessionLoadingId] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const data = await listAgentSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
      setSessionsError('Could not load conversations');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setError('');
    setLastFailedMessage(null);
  };

  const handleSelectSession = async (id) => {
    if (id === sessionId || sessionLoadingId) return;
    setError('');
    setSessionLoadingId(id);
    try {
      const data = await getAgentSession(id);
      setSessionId(data.sessionId);
      setMessages(
        data.messages.length > 0 ? data.messages : [WELCOME_MESSAGE]
      );
    } catch (err) {
      if (err.response?.status === 404) {
        setError('This conversation could not be found — it may have been deleted.');
        loadSessions(); // refresh list, stale entry hata do
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSessionLoadingId(null);
    }
  };

  const formatMessage = (text) => {
    const lines = text.split('\n');
    let html = '';
    let inTable = false;
    let tableRows = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const [headerRow, ...bodyRows] = tableRows;
      html += '<table class="w-full text-sm my-3 border-collapse">';
      html += '<thead><tr>';
      headerRow.forEach((cell) => {
        html += `<th class="border border-gray-700 px-3 py-2 bg-gray-700 text-left">${cell}</th>`;
      });
      html += '</tr></thead><tbody>';
      bodyRows.forEach((row) => {
        html += '<tr>';
        row.forEach((cell) => {
          html += `<td class="border border-gray-700 px-3 py-2 align-top">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      tableRows = [];
    };

    const inlineFormat = (str) =>
      str
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-xs">$1</code>');

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (/^\|.*\|$/.test(trimmed)) {
        const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
        const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));
        if (!isSeparator) {
          tableRows.push(cells.map(inlineFormat));
        }
        inTable = true;
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      if (/^####\s+/.test(trimmed)) {
        html += `<h4 class="text-sm font-bold text-purple-300 mt-3 mb-1">${inlineFormat(trimmed.replace(/^####\s+/, ''))}</h4>`;
        return;
      }
      if (/^###\s+/.test(trimmed)) {
        html += `<h3 class="text-base font-bold text-purple-300 mt-3 mb-1">${inlineFormat(trimmed.replace(/^###\s+/, ''))}</h3>`;
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        html += `<div class="pl-2">• ${inlineFormat(trimmed.replace(/^[-*]\s+/, ''))}</div>`;
        return;
      }

      if (trimmed === '') {
        html += '<div class="h-2"></div>';
        return;
      }

      html += `<div>${inlineFormat(trimmed)}</div>`;
    });

    flushTable();
    return html;
  };

  const sendMessage = async (overrideText) => {
    const textToSend = overrideText ?? input;
    const trimmed = textToSend.trim();

    if (!trimmed || loading) return;

    if (trimmed.length > MAX_INPUT_LENGTH) {
      setError(`⚠️ Message is too long (max ${MAX_INPUT_LENGTH} characters). Please shorten it.`);
      return;
    }

    // Retry ke case mein user message dobara add mat karo (already list mein hai)
    if (!overrideText) {
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    }
    setInput('');
    setError('');
    setLastFailedMessage(null);
    setLoading(true);

    try {
      const data = await sendAgentMessage(trimmed, sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      const isNewSession = !sessionId;
      setSessionId(data.sessionId);
      if (isNewSession) {
        loadSessions();
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      setLastFailedMessage(trimmed);

      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Give me 3 medium questions for a frontend developer role",
    "Evaluate: What is a REST API? A REST API uses HTTP methods to perform CRUD operations.",
    "Give me 5 hard DSA interview questions",
    "Ask me a system design question for backend role",
  ];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center flex-shrink-0">
        <span className="text-xl font-bold text-purple-400">PrepAI</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                + New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {sessionsLoading ? (
                <p className="text-gray-500 text-xs text-center mt-4">Loading...</p>
              ) : sessionsError ? (
                <div className="text-center mt-4 px-2">
                  <p className="text-red-400 text-xs mb-2">{sessionsError}</p>
                  <button
                    onClick={loadSessions}
                    className="text-purple-400 text-xs hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-gray-500 text-xs text-center mt-4 px-2">No conversations yet — start one!</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.sessionId}
                    onClick={() => handleSelectSession(s.sessionId)}
                    disabled={sessionLoadingId === s.sessionId}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition ${
                      sessionId === s.sessionId
                        ? 'bg-purple-600/20 border border-purple-500'
                        : 'hover:bg-gray-800 border border-transparent'
                    } ${sessionLoadingId === s.sessionId ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm text-gray-200 truncate">
                      {sessionLoadingId === s.sessionId ? 'Loading…' : s.preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(s.updatedAt)}</p>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <div className="flex flex-1 flex-col px-4 py-6 overflow-hidden">
          <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm"
                title="Toggle sidebar"
              >
                ☰
              </button>
              <div>
                <h2 className="text-2xl font-bold">🧠 AI Interview Agent</h2>
                <p className="text-gray-400 text-sm">Generate questions, get answers evaluated — all in one chat</p>
              </div>
            </div>

            {messages.length === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left text-sm bg-gray-900 border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white px-4 py-3 rounded-xl transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-1">
                      🧠
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-3 flex-shrink-0 mt-1">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm mr-3">🧠</div>
                  <div className="bg-gray-800 px-5 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="flex items-center justify-between gap-3 mb-2 bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
                {lastFailedMessage && (
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="text-xs bg-red-800/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded-lg transition flex-shrink-0 disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 items-end flex-shrink-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for questions, or paste an answer to evaluate... (Enter to send)"
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-purple-500 text-white placeholder-gray-500 px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl text-sm font-semibold transition flex-shrink-0"
              >
                Send ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;