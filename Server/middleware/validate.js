const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const chatMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required(),
  history: Joi.array().items(
    Joi.object({
      role: Joi.string().valid('user', 'assistant').required(),
      content: Joi.string().required(),
    })
  ).optional(),
});

const answerEvaluatorSchema = Joi.object({
  question: Joi.string().trim().min(1).required(),
  userAnswer: Joi.string().trim().min(1).required(),
  jobRole: Joi.string().trim().min(1).required(),
  topic: Joi.string().trim().optional(),
});

const mockInterviewEvaluateSchema = Joi.object({
  jobRole: Joi.string().trim().optional(),
  question: Joi.string().trim().min(1).required(),
  category: Joi.string().trim().optional(),
  userAnswer: Joi.string().trim().min(1).required(),
  sessionId: Joi.string().trim().min(1).required(),
});

const readinessSchema = Joi.object({
  resumeText: Joi.string().trim().min(1).required(),
  jobRole: Joi.string().trim().min(1).required(),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  chatMessageSchema,
  answerEvaluatorSchema,
  mockInterviewEvaluateSchema,
  readinessSchema,
};