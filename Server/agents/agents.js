const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile'; // apna current model yahan rakho

const AGENTS = {
  resume: {
    description: 'Analyzes resumes, finds skill gaps, gives readiness feedback',
    system: 'You are a resume analysis expert. Give concise, actionable feedback.',
  },
  interviewer: {
    description: 'Asks mock interview questions (DSA, behavioral, HR)',
    system: 'You are a technical interviewer. Ask ONE question at a time and wait for the answer.',
  },
  evaluator: {
    description: 'Scores and critiques a candidate answer',
    system: 'You are a strict but fair interview evaluator. Score out of 10 and list strengths and improvements.',
  },
  systemDesign: {
    description: 'Reviews system design answers and discusses architecture',
    system: 'You are a senior system design interviewer. Discuss tradeoffs, scale, and bottlenecks.',
  },
  coach: {
    description: 'Gives study plans, confidence, dressing and behavior advice',
    system: 'You are a supportive interview coach. Give practical, short advice.',
  },
};

async function runAgent(name, messages) {
  const agent = AGENTS[name];
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: agent.system }, ...messages],
    temperature: 0.6,
  });
  return res.choices[0].message.content;
}

module.exports = { AGENTS, runAgent, groq, MODEL };