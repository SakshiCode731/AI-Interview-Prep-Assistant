const Groq = require('groq-sdk');

const getMockQuestions = async (req, res) => {
  try {
    const { jobRole, difficulty, numberOfQuestions } = req.body;

    if (!jobRole) {
      return res.status(400).json({ message: 'jobRole is required' });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert technical interviewer. Generate ${numberOfQuestions || 5} mock interview questions for the role of ${jobRole} with ${difficulty || 'medium'} difficulty.

Respond in JSON format only, no extra text:
{
  "jobRole": "${jobRole}",
  "difficulty": "${difficulty || 'medium'}",
  "questions": [
    {
      "id": 1,
      "question": "<question text>",
      "category": "<DSA/System Design/HR/Technical>",
      "hint": "<small hint>"
    }
  ]
}`
        }
      ]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const response = JSON.parse(clean);

    res.status(200).json({
      message: 'Mock interview questions generated',
      data: response
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMockQuestions };