const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const Sentry = require('@sentry/node');

// Curated system design questions — hardcoded hai kyunki fixed set hai, DB ki zarurat nahi
const systemDesignQuestions = [
  { id: 1, title: 'Design a URL Shortener', difficulty: 'Medium', hint: 'Think about: hashing, database schema, redirect flow, scalability' },
  { id: 2, title: 'Design a Rate Limiter', difficulty: 'Medium', hint: 'Think about: token bucket, sliding window, distributed rate limiting' },
  { id: 3, title: 'Design a Parking Lot System', difficulty: 'Easy', hint: 'Think about: OOP design, entities, availability tracking' },
  { id: 4, title: 'Design a Chat Application (like WhatsApp)', difficulty: 'Hard', hint: 'Think about: real-time messaging, WebSockets, message delivery guarantees' },
  { id: 5, title: 'Design a Notification System', difficulty: 'Medium', hint: 'Think about: push/email/SMS channels, queuing, retry logic' },
  { id: 6, title: 'Design an E-commerce Cart & Checkout', difficulty: 'Medium', hint: 'Think about: inventory locking, payment flow, order consistency' },
  { id: 7, title: 'Design a News Feed (like Instagram/Twitter)', difficulty: 'Hard', hint: 'Think about: fan-out on write vs read, caching, pagination' },
  { id: 8, title: 'Design a Video Streaming Service (like Netflix)', difficulty: 'Hard', hint: 'Think about: CDN, adaptive bitrate, storage strategy' },
];

const getQuestions = (req, res) => {
  res.status(200).json(systemDesignQuestions);
};

const evaluateDesign = async (req, res) => {
  try {
    const { question, userDesign } = req.body;

    if (!question || !userDesign) {
      return res.status(400).json({ message: 'question and userDesign are required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: `You are a senior system design interviewer at a top product company (like Amazon, Google) evaluating a candidate's system design answer.

Question: ${question}
Candidate's Design Approach: ${userDesign}

Evaluate using a system design specific rubric — this is DIFFERENT from a coding/DSA evaluation. Focus on: requirements clarification, component identification, scalability thinking, and trade-off awareness — NOT just "correct algorithm".

Respond in JSON format only, no extra text, no markdown, no backticks:
{
  "score": <number out of 10>,
  "verdict": "<Excellent/Good/Average/Poor>",
  "feedback": "<2-3 line overall feedback>",
  "requirementsClarity": {
    "addressed": <true/false, did candidate clarify functional/non-functional requirements>,
    "note": "<1 sentence>"
  },
  "componentsIdentified": [<array of system components the candidate correctly identified, e.g. "Load Balancer", "Database", "Cache">],
  "missingComponents": [<array of important components the candidate missed for this problem>],
  "scalabilityThinking": {
    "level": "<High/Medium/Low>",
    "note": "<1 sentence on whether they considered scale, bottlenecks, load>"
  },
  "tradeOffsDiscussed": [<array of trade-offs candidate mentioned, e.g. "SQL vs NoSQL", "Consistency vs Availability" — empty if none>],
  "strengths": [<2-3 specific strengths>],
  "improvements": [<2-3 specific actionable improvements>],
  "idealApproachSummary": "<4-5 sentence summary of a strong approach to this problem>"
}

Rules:
- Be realistic — a one-line answer should score low (1-3), a structured answer covering requirements, components, and trade-offs should score high (7-10).
- Respond with ONLY the JSON object, nothing else.`
        }
      ]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const response = JSON.parse(clean);

    res.status(200).json({ message: 'Design evaluated successfully', data: response });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, evaluateDesign };