const Groq = require('groq-sdk');
const Company = require('../models/Company');
const Sentry = require('@sentry/node');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const retrieveCompanyContext = async (message) => {
  const allCompanies = await Company.find({}, 'name description requiredSkills rounds questions difficulty');
  const lowerMessage = message.toLowerCase();
  const matchedCompany = allCompanies.find((c) =>
    lowerMessage.includes(c.name.toLowerCase())
  );
  if (!matchedCompany) return null;

  const sampleQuestions = matchedCompany.questions.slice(0, 5);

  return {
    name: matchedCompany.name,
    description: matchedCompany.description,
    requiredSkills: matchedCompany.requiredSkills,
    rounds: matchedCompany.rounds,
    difficulty: matchedCompany.difficulty,
    sampleQuestions,
  };
};

const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    const companyContext = await retrieveCompanyContext(message);

    let systemPrompt = `You are PrepAI — an expert AI interview preparation assistant for engineering students in India. 
Help students with: company-specific interview preparation, DSA questions, resume tips, HR questions, study plans, confidence tips, and career guidance.
Be concise, friendly, and practical. Use bullet points when listing tips. Always encourage the student.`;

    if (companyContext) {
      systemPrompt += `

IMPORTANT — The student is asking about ${companyContext.name}. You have access to VERIFIED REAL interview data for this company from past candidates. Use ONLY this data to answer — do not make up or guess information about this company's process.

Verified data for ${companyContext.name}:
- Description: ${companyContext.description}
- Difficulty: ${companyContext.difficulty}
- Required Skills: ${companyContext.requiredSkills.join(', ')}
- Interview Rounds: ${companyContext.rounds.join(' → ')}
- Sample real interview questions asked:
${companyContext.sampleQuestions.map((q, i) => `  ${i + 1}. [${q.round}] ${q.question}`).join('\n')}

Base your answer strictly on this verified data. If asked something not covered here, say you don't have that specific detail but can share what you do know.`;
    }

    const formattedHistory = (history || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      max_tokens: 800
    });

    res.status(200).json({
      reply: completion.choices[0].message.content,
      grounded: !!companyContext,
      groundedCompany: companyContext?.name || null,
    });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage };