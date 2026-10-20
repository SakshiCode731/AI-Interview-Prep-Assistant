const Company = require('../models/Company');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds a company mentioned in the message and returns its verified data.
// Word-boundary match so a short name (e.g. "Go") does not match inside "good".
async function retrieveCompanyContext(message) {
  if (!message) return null;

  const companies = await Company.find(
    {},
    'name description requiredSkills rounds questions difficulty'
  ).lean();

  const text = message.toLowerCase();
  const matched = companies.find((c) => {
    const name = (c.name || '').toLowerCase().trim();
    if (!name) return false;
    return new RegExp(`(^|[^a-z0-9])${escapeRegex(name)}($|[^a-z0-9])`).test(text);
  });

  if (!matched) return null;

  return {
    name: matched.name,
    description: matched.description,
    requiredSkills: matched.requiredSkills || [],
    rounds: matched.rounds || [],
    difficulty: matched.difficulty,
    sampleQuestions: (matched.questions || []).slice(0, 5),
  };
}

// Prompt block appended to the system prompt when a company matched.
function buildCompanyPrompt(ctx) {
  if (!ctx) return '';
  return `

IMPORTANT — The student is asking about ${ctx.name}. You have access to VERIFIED REAL interview data for this company from past candidates. Use ONLY this data to answer — do not make up or guess information about this company's process.

Verified data for ${ctx.name}:
- Description: ${ctx.description}
- Difficulty: ${ctx.difficulty}
- Required Skills: ${ctx.requiredSkills.join(', ')}
- Interview Rounds: ${ctx.rounds.join(' → ')}
- Sample real interview questions asked:
${ctx.sampleQuestions.map((q, i) => `  ${i + 1}. [${q.round}] ${q.question}`).join('\n')}

Base your answer strictly on this verified data. If asked something not covered here, say you don't have that specific detail but can share what you do know.`;
}

module.exports = { retrieveCompanyContext, buildCompanyPrompt };