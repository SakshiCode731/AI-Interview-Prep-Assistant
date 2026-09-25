const { groq: client } = require('../config/groqConfig');
const { tools } = require('../config/agentTools');
const ChatSession = require('../models/ChatSession');
const { agentGraph, generateQuestions, evaluateAnswer } = require('../agents/agentGraph');

// Kept for backward compatibility with any file that imports it
const availableFunctions = { generateQuestions, evaluateAnswer };

// --- Agent runner (DB-backed history + LangGraph multi-agent flow) ---

async function runAgent({ userId, sessionId, userMessage }) {
  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new Error('Session not found or does not belong to this user');
    }
  } else {
    session = await ChatSession.create({ user: userId, messages: [] });
  }

  // Plain user/assistant text only (old tool messages are skipped)
  const history = session.messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && !(m.toolCalls && m.toolCalls.length > 0))
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-10);

  const result = await agentGraph.invoke({ userMessage, history });

  console.log(`✅ Agent used: ${result.agentUsed || 'responder only'}`);

  session.messages.push({ role: 'user', content: userMessage });
  session.messages.push({ role: 'assistant', content: result.reply });
  await session.save();

  return { reply: result.reply, sessionId: session._id };
}

// --- List all sessions for a user ---
async function listSessions(userId) {
  const sessions = await ChatSession.find({ user: userId })
    .select('title createdAt updatedAt messages')
    .sort({ updatedAt: -1 });

  return sessions.map((s) => {
    const lastUserMsg = [...s.messages].reverse().find((m) => m.role === 'user');
    return {
      sessionId: s._id,
      title: s.title,
      preview: lastUserMsg ? lastUserMsg.content.slice(0, 60) : 'New conversation',
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    };
  });
}

// --- Get full session (poora chat history) ---
async function getSession(userId, sessionId) {
  const session = await ChatSession.findOne({ _id: sessionId, user: userId });
  if (!session) {
    throw new Error('Session not found');
  }

  const displayMessages = session.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));

  return { sessionId: session._id, title: session.title, messages: displayMessages };
}

module.exports = { client, availableFunctions, tools, runAgent, listSessions, getSession };