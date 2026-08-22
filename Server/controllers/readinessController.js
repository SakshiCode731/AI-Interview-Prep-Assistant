const Groq = require('groq-sdk');
const Sentry = require('@sentry/node');

const getReadinessScore = async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({ message: 'resumeText and jobRole are required' });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: `You are an expert career coach. Analyze this resume and give a readiness score out of 100 for the role of ${jobRole}.
          
Resume:
${resumeText}

Respond in JSON format only, no extra text:
{
  "score": <number>,
  "strengths": [<list of strengths>],
  "improvements": [<list of improvements>],
  "summary": "<brief summary>"
}`
        }
      ]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const response = JSON.parse(clean);

    res.status(200).json({
      message: 'Readiness score generated',
      data: response
    });

  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReadinessScore };