const Groq = require('groq-sdk');
const Readiness = require('../models/Readiness');

// @desc   Analyze resume and generate a readiness score (persists the result)
// @route  POST /api/readiness
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
  "score": <number 0-100, overall readiness>,
  "skillsMatch": <number 0-100, how well the candidate's skills match the ${jobRole} role>,
  "experience": <number 0-100, relevance and depth of work experience for this role>,
  "projects": <number 0-100, quality and relevance of projects listed>,
  "resumeQuality": <number 0-100, clarity, structure, and presentation of the resume itself>,
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

    // Persist this analysis so the dashboard can show the latest real score
    // instead of a one-off value that disappears after this request.
    const saved = await Readiness.create({
      user: req.user._id,
      jobRole,
      score: response.score,
      skillsMatch: response.skillsMatch,
      experience: response.experience,
      projects: response.projects,
      resumeQuality: response.resumeQuality,
      strengths: response.strengths || [],
      improvements: response.improvements || [],
      summary: response.summary || ''
    });

    res.status(200).json({
      message: 'Readiness score generated',
      data: saved
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get the logged-in user's most recent readiness analysis
// @route  GET /api/readiness/me
const getMyReadiness = async (req, res) => {
  try {
    const latest = await Readiness.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(200).json({ analyzed: false, data: null });
    }

    res.status(200).json({ analyzed: true, data: latest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReadinessScore, getMyReadiness };