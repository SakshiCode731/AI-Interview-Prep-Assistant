const Groq = require('groq-sdk');
const Answer = require('../models/Answer');

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

const evaluateAnswer = async (req, res) => {
  try {
    const { jobRole, question, category, userAnswer, sessionId } = req.body;

    if (!question || !userAnswer || !sessionId) {
      return res.status(400).json({ message: 'question, userAnswer, and sessionId are required' });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert technical interviewer evaluating a candidate's answer for a ${jobRole || 'software developer'} role.

Question: "${question}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer on correctness, clarity, and completeness. Respond in JSON format only, no extra text:
{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": "<what was good about the answer, 1 short sentence>",
  "improvement": "<what could be improved, 1 short sentence>"
}`
        }
      ]
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(clean);

    // Save this evaluated answer to the database, tied to the logged-in user
    const savedAnswer = await Answer.create({
      user: req.user._id,
      sessionId,
      jobRole: jobRole || '',
      question,
      category: category || 'Technical',
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvement: evaluation.improvement
    });

    res.status(200).json({
      message: 'Answer evaluated',
      data: evaluation
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMockQuestions, evaluateAnswer };