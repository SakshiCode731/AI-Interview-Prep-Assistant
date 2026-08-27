import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAgentMessage } from '../services/agentService';

const AgentChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Interview Agent 🤖 Ask me to generate practice questions, or paste an answer and I'll evaluate it for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      // Table row detection: starts and ends with |
      if (/^\|.*\|$/.test(trimmed)) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Skip separator rows like |---|---|
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

      // Headings
      if (/^####\s+/.test(trimmed)) {
        html += `<h4 class="text-sm font-bold text-purple-300 mt-3 mb-1">${inlineFormat(trimmed.replace(/^####\s+/, ''))}</h4>`;
        return;
      }
      if (/^###\s+/.test(trimmed)) {
        html += `<h3 class="text-base font-bold text-purple-300 mt-3 mb-1">${inlineFormat(trimmed.replace(/^###\s+/, ''))}</h3>`;
        return;
      }

      // Bullets
      if (/^[-*]\s+/.test(trimmed)) {
        html += `<div class="pl-2">• ${inlineFormat(trimmed.replace(/^[-*]\s+/, ''))}</div>`;
        return;
      }

      // Empty line
      if (trimmed === '') {
        html += '<div class="h-2"></div>';
        return;
      }

      // Normal paragraph line
      html += `<div>${inlineFormat(trimmed)}</div>`;
    });

    flushTable(); // agar text table pe khatam ho raha ho

    return html;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await sendAgentMessage(userMessage.content, sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
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

      <div className="flex flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">🧠 AI Interview Agent</h2>
          <p className="text-gray-400 text-sm">Generate questions, get answers evaluated — all in one chat</p>
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

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <div className="flex gap-3 items-end flex-shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for questions, or paste an answer to evaluate... (Enter to send)"
            rows={1}
            className="flex-1 bg-gray-900 border border-gray-700 focus:border-purple-500 text-white placeholder-gray-500 px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl text-sm font-semibold transition flex-shrink-0"
          >
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;