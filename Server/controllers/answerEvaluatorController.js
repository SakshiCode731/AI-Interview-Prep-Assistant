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
          content: `You are a strict but fair technical interview coach evaluating a candidate's answer for the role of ${jobRole}.

Question: ${question}
Candidate's Answer: ${userAnswer}

Evaluate this answer using the rubric below and respond in JSON format only, no extra text, no markdown, no backticks:
{
  "score": <number out of 10, overall quality>,
  "verdict": "<Excellent/Good/Average/Poor>",
  "feedback": "<overall feedback in 2-3 lines>",
  "clarityScore": <number 0-10, how clear and well-structured the explanation is>,
  "starAdherence": {
    "applicable": <true if this is a behavioral/HR/project question that should use STAR method, false if it's a pure technical/coding/theory question>,
    "situation": <true/false, whether candidate described the context/situation>,
    "task": <true/false, whether candidate explained the task/goal>,
    "action": <true/false, whether candidate explained specific actions taken>,
    "result": <true/false, whether candidate stated a measurable outcome/result>,
    "note": "<1 sentence on STAR structure quality, or 'Not applicable for this technical question' if applicable is false>"
  },
  "keywordCoverage": {
    "expectedKeywords": [<array of 4-6 key technical terms/concepts this answer should ideally mention>],
    "coveredKeywords": [<array of which expected keywords the candidate actually used or clearly demonstrated understanding of>],
    "missingKeywords": [<array of expected keywords NOT covered>]
  },
  "confidenceIndicators": {
    "level": "<High/Medium/Low>",
    "positiveSignals": [<array of 0-3 short phrases suggesting confidence, e.g. "Used specific examples and metrics" — empty array if none>],
    "hesitationSignals": [<array of 0-3 short phrases suggesting hesitation, e.g. "Frequent qualifiers like 'maybe' or 'I think'", "Very short answer lacking depth" — empty array if none>]
  },
  "strengths": [<what candidate did well>],
  "improvements": [<what candidate should improve>],
  "idealAnswer": "<brief ideal answer>"
}

Rules:
- Be honest and calibrated — a 2-word or vague answer should score low (1-3), a thorough well-structured answer should score high (7-10).
- For starAdherence.applicable: set to false for pure DSA/coding/theory/technical trivia questions. Set to true for behavioral, HR, project-explanation, or "tell me about a time" questions.
- keywordCoverage should reflect real technical terms relevant to the specific question, not generic filler words.
- Respond with ONLY the JSON object, nothing else.`
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