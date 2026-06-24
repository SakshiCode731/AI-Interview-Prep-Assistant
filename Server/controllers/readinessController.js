const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getReadinessScore = async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({ message: 'resumeText and jobRole are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert career coach. Analyze this resume and give a readiness score out of 100 for the role of ${jobRole}.
          
Resume:
${resumeText}

Respond in JSON format only, no extra text:
{
  "score": <number>,
  "strengths": [<list of strengths>],
  "improvements": [<list of improvements>],
  "summary": "<brief summary>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const response = JSON.parse(clean);

    res.status(200).json({
      message: 'Readiness score generated',
      data: response
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReadinessScore };