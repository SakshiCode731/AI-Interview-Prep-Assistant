require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default model: chat, question generation, general tasks
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// Stronger model: answer scoring and feedback
const GROQ_MODEL_EVALUATOR =
  process.env.GROQ_MODEL_EVALUATOR || "openai/gpt-oss-120b";

module.exports = { groq, GROQ_MODEL, GROQ_MODEL_EVALUATOR };