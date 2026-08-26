const tools = [
  {
    type: "function",
    function: {
      name: "generateQuestions",
      description: "Generate mock interview questions for a given job role and difficulty level",
      parameters: {
        type: "object",
        properties: {
          jobRole: { type: "string", description: "The job role, e.g. 'Frontend Developer'" },
          difficulty: { type: "string", description: "easy, medium, or hard" },
          numberOfQuestions: { type: "number", description: "How many questions to generate" }
        },
        required: ["jobRole"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "evaluateAnswer",
      description: "Evaluate a candidate's answer to an interview question and give a score with feedback",
      parameters: {
        type: "object",
        properties: {
          jobRole: { type: "string" },
          question: { type: "string" },
          userAnswer: { type: "string" }
        },
        required: ["question", "userAnswer"]
      }
    }
  }
];

module.exports = { tools };