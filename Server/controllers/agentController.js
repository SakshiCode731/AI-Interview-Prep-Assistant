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
  // Step 1: Session fetch karo ya naya banao
  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new Error('Session not found or does not belong to this user');
    }
  } else {
    session = await ChatSession.create({ user: userId, messages: [] });
  }

  // Step 2: Purani history + naya message combine karo
  const history = session.messages.map((m) => ({
    role: m.role,
    content: m.content,
    ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
  }));

  let messages = [...history, { role: 'user', content: userMessage }];

  // Naya user message DB mein save karo
  session.messages.push({ role: 'user', content: userMessage });

  // Step 3: Pehla Groq call — tool chahiye ya nahi decide karega
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
        content: JSON.stringify(functionResult)
      };

      messages.push(toolMessage);

      // Tool result bhi DB mein save karo (context ke liye)
      session.messages.push({
        role: 'tool',
        content: toolMessage.content,
        toolCallId: toolCall.id,
      });
    }

    // Dusra call — final answer tool results ke saath
    response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages
    });

    finalReply = response.choices[0].message.content;
  } else {
    finalReply = responseMessage.content;
  }

  // Step 4: Assistant ka final reply bhi DB mein save karo
  session.messages.push({ role: 'assistant', content: finalReply });
  await session.save();

  return { reply: finalReply, sessionId: session._id };
}

module.exports = { client, availableFunctions, tools, runAgent };