const Anthropic = require('@anthropic-ai/sdk');

const getReadinessScore = async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({ message: 'resumeText and jobRole are required' });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert career coach. Analyze this resume and give a readiness score out of 100 for the role of ${jobRole}.
          
Resume:
${resumeText}

Respond in JSON format:
{
  "score": <number>,
  "strengths": [<list of strengths>],
  "improvements": [<list of improvements>],
  "summary": "<brief summary>"
}`
        }
      ]
    });

    const response = JSON.parse(message.content[0].text);

    res.status(200).json({
      message: 'Readiness score generated',
      data: response
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReadinessScore };