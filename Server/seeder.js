const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./models/Company');

dotenv.config();

const companies = [
  {
    name: "TCS",
    description: "India's largest IT services company",
    requiredSkills: ["Java", "DSA", "SQL", "Communication"],
    rounds: ["Aptitude Test", "Technical Round", "Managerial Round", "HR Round"],
    difficulty: "Easy",
    questions: [
      { question: "What is OOP?", difficulty: "Easy", round: "Technical Round" },
      { question: "Explain normalization in SQL", difficulty: "Medium", round: "Technical Round" },
      { question: "Where do you see yourself in 5 years?", difficulty: "Easy", round: "HR Round" }
    ]
  },
  {
    name: "Infosys",
    description: "Global IT and consulting company",
    requiredSkills: ["Python", "DSA", "Problem Solving", "Communication"],
    rounds: ["Online Test", "Technical Interview", "HR Round"],
    difficulty: "Easy",
    questions: [
      { question: "Reverse a string without using built-in functions", difficulty: "Easy", round: "Technical Interview" },
      { question: "What is the difference between stack and queue?", difficulty: "Easy", round: "Technical Interview" },
      { question: "Why do you want to join Infosys?", difficulty: "Easy", round: "HR Round" }
    ]
  },
  {
    name: "Wipro",
    description: "IT, consulting and business process services",
    requiredSkills: ["C++", "Java", "DSA", "Aptitude"],
    rounds: ["Written Test", "Technical Round 1", "Technical Round 2", "HR Round"],
    difficulty: "Medium",
    questions: [
      { question: "Find duplicate elements in an array", difficulty: "Medium", round: "Technical Round 1" },
      { question: "What is polymorphism?", difficulty: "Easy", round: "Technical Round 1" },
      { question: "Explain your final year project", difficulty: "Medium", round: "Technical Round 2" }
    ]
  },
  {
    name: "Amazon",
    description: "Global tech giant - ecommerce and cloud (AWS)",
    requiredSkills: ["DSA", "System Design", "Problem Solving", "Leadership Principles"],
    rounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Bar Raiser", "HR Round"],
    difficulty: "Hard",
    questions: [
      { question: "Implement LRU Cache", difficulty: "Hard", round: "Technical Round 1" },
      { question: "Tell me about a time you showed leadership", difficulty: "Medium", round: "Bar Raiser" },
      { question: "Find the longest substring without repeating characters", difficulty: "Hard", round: "Technical Round 2" }
    ]
  },
  {
    name: "Accenture",
    description: "Global professional services company",
    requiredSkills: ["Communication", "Problem Solving", "Any Programming Language"],
    rounds: ["Cognitive Test", "Technical Interview", "HR Round"],
    difficulty: "Easy",
    questions: [
      { question: "What is cloud computing?", difficulty: "Easy", round: "Technical Interview" },
      { question: "Explain SDLC", difficulty: "Easy", round: "Technical Interview" },
      { question: "What are your strengths and weaknesses?", difficulty: "Easy", round: "HR Round" }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    await Company.deleteMany(); // pehle se jo data hai wo delete karo
    console.log('Old company data deleted...');

    await Company.insertMany(companies);
    console.log('Companies seeded successfully!');

    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedDB();