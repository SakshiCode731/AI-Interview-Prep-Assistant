const Groq = require('groq-sdk');
const Company = require('../models/Company');

// there is adding some code for the chat controller to handle the chat functionality with RAG (Retrieval-Augmented Generation) approach. The code includes a function to retrieve company context based on user messages and a function to send messages to the AI model, incorporating the retrieved context into the system prompt.

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Retrieval function — user ke message mein company ka naam dhundo aur uska real data DB se lao
const retrieveCompanyContext = async (message) => {
  const allCompanies = await Company.find({}, 'name description requiredSkills rounds questions difficulty');

  const lowerMessage = message.toLowerCase();

  // Company naam match karo message ke andar (case-insensitive, partial match bhi allow karo)
  const matchedCompany = allCompanies.find((c) =>
    lowerMessage.includes(c.name.toLowerCase())
  );

  if (!matchedCompany) return null;

  // Sirf 4-5 sample questions bhejo (poore 10 nahi — token limit ke liye)
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

    // RAG Step 1: Retrieval — check karo message mein koi company mentioned hai
    const companyContext = await retrieveCompanyContext(message);

    // RAG Step 2: Context injection — agar company mili, uska real data prompt mein add karo
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
      model: 'llama-3.3-70b-versatile',
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage };