const { StateGraph, Annotation, START, END } = require('@langchain/langgraph');
const { groq: client, GROQ_MODEL, GROQ_MODEL_EVALUATOR } = require('../config/groqConfig');
const { retrieveCompanyContext, buildCompanyPrompt } = require('../utils/companyRetrieval');

// ---------- helpers ----------

function parseJson(text) {
  const clean = (text || '').replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : clean);
}

// ---------- agent logic (same as before, now shared) ----------

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
  return parseJson(completion.choices[0].message.content);
}

async function evaluateAnswer({ jobRole, question, userAnswer }) {
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL_EVALUATOR,
    messages: [
      {
        role: 'user',
        content: `Evaluate this answer for a ${jobRole || 'developer'} role. Question: "${question}" Answer: "${userAnswer}". Respond in JSON only: {"score":0-10,"feedback":"...","strengths":"...","improvement":"..."}`
      }
    ]
  });
  return parseJson(completion.choices[0].message.content);
}

// ---------- graph state ----------

const AgentState = Annotation.Root({
  userMessage: Annotation(),
  history: Annotation(),
  intent: Annotation(),
  args: Annotation(),
  toolResult: Annotation(),
  companyContext: Annotation(), // NEW: verified company data (retrieval result)
  agentUsed: Annotation(),
  reply: Annotation(),
});

// ---------- nodes (each node = one agent) ----------

// Router: decides which agent should handle the message
async function routerNode(state) {
  let route = { intent: 'chat', args: {} };
  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a router for an interview prep assistant. Read the user's latest message and decide the intent.
Respond in JSON only:
{"intent":"generate_questions"|"evaluate_answer"|"chat","args":{...}}

Rules:
- generate_questions: user wants interview questions. args: {"jobRole":"...","difficulty":"easy|medium|hard","numberOfQuestions":number}
- evaluate_answer: user gives a question and their answer to be scored. args: {"jobRole":"...","question":"...","userAnswer":"..."}
- chat: anything else (advice, explanations, greetings, company questions). args: {}
Only include args you can find in the conversation.`
        },
        ...state.history.slice(-6),
        { role: 'user', content: state.userMessage }
      ]
    });
    const parsed = parseJson(completion.choices[0].message.content);
    if (['generate_questions', 'evaluate_answer', 'chat'].includes(parsed.intent)) {
      route = { intent: parsed.intent, args: parsed.args || {} };
    }
  } catch (err) {
    console.error('Router failed, falling back to chat:', err.message);
  }
  console.log(`🧭 Router → ${route.intent}`, route.args);
  return { intent: route.intent, args: route.args };
}

// Interviewer agent: generates questions
async function interviewerNode(state) {
  try {
    const result = await generateQuestions(state.args);
    return { toolResult: result, agentUsed: 'interviewer' };
  } catch (err) {
    console.error('Interviewer agent failed:', err.message);
    return { toolResult: { error: 'Could not generate questions' }, agentUsed: 'interviewer' };
  }
}

// Evaluator agent: scores an answer
async function evaluatorNode(state) {
  if (!state.args.question || !state.args.userAnswer) {
    return {
      toolResult: { error: 'Missing question or answer. Ask the user to provide both.' },
      agentUsed: 'evaluator'
    };
  }
  try {
    const result = await evaluateAnswer(state.args);
    return { toolResult: result, agentUsed: 'evaluator' };
  } catch (err) {
    console.error('Evaluator agent failed:', err.message);
    return { toolResult: { error: 'Could not evaluate the answer' }, agentUsed: 'evaluator' };
  }
}

// NEW — Knowledge agent: handles general chat.
// If the message names a company in our DB, it retrieves verified data (company agent);
// otherwise it acts as the general interview coach.
async function knowledgeNode(state) {
  try {
    const ctx = await retrieveCompanyContext(state.userMessage);
    if (ctx) {
      return { companyContext: ctx, agentUsed: 'company' };
    }
  } catch (err) {
    console.error('Company retrieval failed, continuing as coach:', err.message);
  }
  return { agentUsed: 'coach' };
}

// Responder: writes the final natural-language reply
async function responderNode(state) {
  let system =
    'You are a helpful interview prep assistant. Always respond in clear, natural, well-formatted language for a chat UI — never output raw JSON or code blocks. Use markdown headings, bold text, and tables where helpful.';

  if (state.companyContext) {
    system += buildCompanyPrompt(state.companyContext);
  }

  if (state.toolResult) {
    system += `\n\nThe ${state.agentUsed} agent produced this result. Present it clearly to the user (if it contains an error, explain what is missing and ask for it):\n${JSON.stringify(state.toolResult)}`;
  }

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: system },
      ...state.history,
      { role: 'user', content: state.userMessage }
    ]
  });

  return { reply: completion.choices[0].message.content };
}

// ---------- routing logic ----------

function routeByIntent(state) {
  if (state.intent === 'generate_questions') return 'interviewer';
  if (state.intent === 'evaluate_answer') return 'evaluator';
  return 'knowledge';
}

// ---------- build the graph ----------

const workflow = new StateGraph(AgentState)
  .addNode('router', routerNode)
  .addNode('interviewer', interviewerNode)
  .addNode('evaluator', evaluatorNode)
  .addNode('knowledge', knowledgeNode)
  .addNode('responder', responderNode)
  .addEdge(START, 'router')
  .addConditionalEdges('router', routeByIntent, {
    interviewer: 'interviewer',
    evaluator: 'evaluator',
    knowledge: 'knowledge',
  })
  .addEdge('interviewer', 'responder')
  .addEdge('evaluator', 'responder')
  .addEdge('knowledge', 'responder')
  .addEdge('responder', END);

const agentGraph = workflow.compile();

module.exports = { agentGraph, generateQuestions, evaluateAnswer };