const Groq = require('groq-sdk');
const { GROQ_MODEL } = require('../config/groqConfig');
const { tools } = require('../config/agentTools');
const ChatSession = require('../models/ChatSession');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Tool functions (reusable core logic, bina req/res ke) ---

async function generateQuestions({ jobRole, difficulty, numberOfQuestions }) {
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: `Generate ${numberOfQuestions || 5} mock interview questions for ${jobRole} with ${difficulty || 'medium'} difficulty. Respond in JSON only: {"questions": [{"id":1,"question":"...","category":"...","hint":"..."}]}`
      }
    ]
  });
  const clean = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function evaluateAnswer({ jobRole, question, userAnswer }) {
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: `Evaluate this answer for a ${jobRole || 'developer'} role. Question: "${question}" Answer: "${userAnswer}". Respond in JSON only: {"score":0-10,"feedback":"...","strengths":"...","improvement":"..."}`
      }
    ]
  });
  const clean = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// --- Function name → actual function mapping ---
const availableFunctions = { generateQuestions, evaluateAnswer };

// --- Agent runner (DB-backed conversation history ke saath) ---

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

  // Purani history ko Groq format mein reconstruct karo
  const history = session.messages.map((m) => {
    if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
      return { role: 'assistant', content: m.content || null, tool_calls: m.toolCalls };
    }
    if (m.role === 'tool') {
      return { role: 'tool', tool_call_id: m.toolCallId, name: m.toolName, content: m.content };
    }
    return { role: m.role, content: m.content };
  });

  let messages = [...history, { role: 'user', content: userMessage }];
  session.messages.push({ role: 'user', content: userMessage });

  let response = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    tools,
    tool_choice: 'auto'
  });

  let responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  let finalReply;

  if (toolCalls && toolCalls.length > 0) {
    messages.push(responseMessage);

    // Assistant ka tool-call request DB mein save karo (poore tool_calls array ke saath)
    session.messages.push({
      role: 'assistant',
      content: responseMessage.content || '',
      toolCalls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionToCall = availableFunctions[functionName];

      if (!functionToCall) {
        console.error(`Unknown tool called: ${functionName}`);
        continue;
      }

      console.log(`🔧 Calling tool: ${functionName}`, functionArgs);
      const functionResult = await functionToCall(functionArgs);

      const toolMessage = {
        role: 'tool',
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify(functionResult)
      };

      messages.push(toolMessage);

      session.messages.push({
        role: 'tool',
        content: toolMessage.content,
        toolCallId: toolCall.id,
        toolName: functionName,
      });
    }

    response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages
    });

    finalReply = response.choices[0].message.content;
  } else {
    finalReply = responseMessage.content;
  }

  session.messages.push({ role: 'assistant', content: finalReply });
  await session.save();

  return { reply: finalReply, sessionId: session._id };
}
module.exports = { client, availableFunctions, tools, runAgent };