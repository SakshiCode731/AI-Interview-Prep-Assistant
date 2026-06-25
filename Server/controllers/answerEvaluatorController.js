const Groq = require('groq-sdk');

const evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer, jobRole } = req.body;

    if (!question || !userAnswer || !jobRole) {
      return res.status(400).json({ message: 'question, userAnswer and jobRole are required' });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert technical interviewer evaluating a candidate's answer for the role of ${jobRole}.

Question: ${question}
Candidate's Answer: ${userAnswer}

Evaluate the answer and respond in JSON format only, no extra text:
{
  "score": <number out of 10>,
  "verdict": "<Excellent/Good/Average/Poor>",
  "strengths": [<what candidate did well>],
  "improvements": [<what candidate should improve>],
  "idealAnswer": "<brief ideal answer>",
  "feedback": "<overall feedback in 2-3 lines>"
}`
        }
      ]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const response = JSON.parse(clean);

    res.status(200).json({
      message: 'Answer evaluated successfully',
      data: response
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { evaluateAnswer };