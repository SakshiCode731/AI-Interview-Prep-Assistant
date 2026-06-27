const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    const systemPrompt = `You are PrepAI — an expert AI interview preparation assistant for engineering students in India. 
Help students with: company-specific interview preparation, DSA questions, resume tips, HR questions, study plans, confidence tips, and career guidance.
Be concise, friendly, and practical. Use bullet points when listing tips. Always encourage the student.`;

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

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage };