import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm PrepAI Assistant 🤖 Ask me anything about interview preparation, resume tips, company-specific questions, or study plans!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const formatMessage = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* /gm, '• ')
    .replace(/^\s{2}\* /gm, '  · ')
    .replace(/\*(?!\*)/g, '');  // remaining single * remove karo
};

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/chat/message', {
        message: input,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
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
    "How should I prepare for TCS interview?",
    "What are common DSA questions asked in interviews?",
    "How to write a good resume for fresher?",
    "Tips to stay calm during interview?",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
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
          <h2 className="text-2xl font-bold">🤖 AI Interview Assistant</h2>
          <p className="text-gray-400 text-sm">Ask anything about interviews, companies, resume, or study plans</p>
        </div>

        {/* Suggested Questions */}
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-1">
                  🤖
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
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm mr-3">🤖</div>
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

        {/* Input Box */}
        <div className="flex gap-3 items-end flex-shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your interview question... (Enter to send)"
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

export default Chatbot;