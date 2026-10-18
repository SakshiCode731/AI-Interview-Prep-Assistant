const { AGENTS, runAgent, groq, MODEL } = require('./agents');

async function pickAgent(userMessage) {
  const list = Object.entries(AGENTS)
    .map(([k, v]) => `- ${k}: ${v.description}`)
    .join('\n');

  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a router. Pick the best agent for the user's message.\nAgents:\n${list}\nReply ONLY as JSON: {"agent":"<key>"}`,
      },
      { role: 'user', content: userMessage },
    ],
  });

  try {
    const { agent } = JSON.parse(res.choices[0].message.content);
    return AGENTS[agent] ? agent : 'coach';
  } catch {
    return 'coach'; // safe fallback
  }
}

async function handleMessage(history) {
  const last = history[history.length - 1].content;
  const agent = await pickAgent(last);
  const reply = await runAgent(agent, history);
  return { agent, reply };
}

module.exports = { handleMessage };