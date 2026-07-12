const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./models/Company');

dotenv.config();

const companies = [
  {
    name: "TCS",
    description: "TCS NQT (National Qualifier Test) — 88 questions in 165 mins covering Numerical, Verbal, Logical Ability, Advanced Aptitude, and Coding (2 questions, 7 test cases each). Score decides Ninja (basic) vs Digital (advanced) offer.",
    requiredSkills: ["Java", "C", "SQL", "DSA", "Communication", "Aptitude"],
    rounds: ["TCS NQT (Numerical + Verbal + Logical + Advanced Aptitude + Coding)", "Technical Interview", "HR Interview"],
    difficulty: "Easy",
    questions: [
      { question: "Explain any one of the greedy algorithms with an example", difficulty: "Medium", round: "Technical Interview" },
      { question: "Explain joins in SQL and their differences (INNER, LEFT, RIGHT, FULL)", difficulty: "Medium", round: "Technical Interview" },
      { question: "Explain the Software Development Life Cycle (SDLC)", difficulty: "Easy", round: "Technical Interview" },
      { question: "What is the difference between DELETE, DROP, and TRUNCATE commands in SQL?", difficulty: "Medium", round: "Technical Interview" },
      { question: "What is the difference between authorization and authentication?", difficulty: "Easy", round: "Technical Interview" },
      { question: "Explain your final year project in detail — architecture and your role", difficulty: "Medium", round: "Technical Interview" },
      { question: "Do you know about TCS's service agreement (bond)?", difficulty: "Easy", round: "HR Interview" },
      { question: "Are you willing to relocate to any TCS location in India?", difficulty: "Easy", round: "HR Interview" },
      { question: "Why should we hire you over other candidates?", difficulty: "Easy", round: "HR Interview" },
      { question: "Write a program to compress a string (e.g. 'aaabbCCC' → 'a3b2C3')", difficulty: "Medium", round: "TCS NQT (Numerical + Verbal + Logical + Advanced Aptitude + Coding)" },
    ]
  },
  {
    name: "Infosys",
    description: "Infosys hiring via InfyTQ / pool-campus — Online Assessment (Aptitude, Verbal, Pseudocode, Puzzle Solving with sectional cutoffs, usually 75%+ per section) followed by a combined Technical + HR interview focused heavily on resume and projects.",
    requiredSkills: ["Java", "Python", "SQL", "DSA", "Problem Solving", "Communication"],
    rounds: ["Online Assessment (Aptitude + Verbal + Pseudocode + Puzzles)", "Technical + HR Interview (Combined)"],
    difficulty: "Easy",
    questions: [
      { question: "Tell me about yourself", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Why is your CGPA lower than your 10th/12th percentage? Justify it", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Explain the syntax for UPDATE in SQL", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "What is the use of #include in C?", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Write a query to find the 5th highest salary from an Employee table", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Explain the SDLC — who is a Scrum Master, what is Sprint Planning?", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Explain your final-year / mini project in detail — technologies used and challenges faced", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "What are your strengths, weaknesses, and how adaptable are you to new roles?", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
    ]
  },
  {
    name: "Wipro",
    description: "Wipro Elite NTH — Online Assessment on AMCAT/CoCubes (Aptitude + Written Essay + 2 Coding questions), followed by a combined Technical + HR 'Business Discussion' round focused on Java, SQL, and OOP fundamentals.",
    requiredSkills: ["Java", "SQL", "OOP", "DSA", "Communication"],
    rounds: ["Online Assessment (Aptitude + Essay + Coding)", "Technical + HR Interview (Business Discussion)"],
    difficulty: "Medium",
    questions: [
      { question: "What is a primary key? What is an alternate key?", difficulty: "Easy", round: "Technical + HR Interview (Business Discussion)" },
      { question: "Explain inheritance, polymorphism, exception handling, and file handling in Java", difficulty: "Medium", round: "Technical + HR Interview (Business Discussion)" },
      { question: "Write basic SQL queries using JOINs, GROUP BY, and aggregate functions", difficulty: "Medium", round: "Technical + HR Interview (Business Discussion)" },
      { question: "What is the difference between a linked list and an array?", difficulty: "Easy", round: "Technical + HR Interview (Business Discussion)" },
      { question: "Explain paging in operating systems", difficulty: "Medium", round: "Technical + HR Interview (Business Discussion)" },
      { question: "Write code to reverse a string without using built-in functions", difficulty: "Easy", round: "Technical + HR Interview (Business Discussion)" },
      { question: "Find the k'th largest element in an array", difficulty: "Medium", round: "Online Assessment (Aptitude + Essay + Coding)" },
      { question: "Are you comfortable with the 15-month service agreement/bond with Wipro?", difficulty: "Easy", round: "Technical + HR Interview (Business Discussion)" },
    ]
  },
  {
    name: "Cognizant",
    description: "Cognizant GenC/GenC Pro/GenC Next hiring via Superset — Communication (Versant) round, Aptitude + gamified reasoning round, Technical Assessment (coding + SQL + web dev based on chosen skill cluster like Java or C#), then combined Technical + HR interview.",
    requiredSkills: ["Java/C#", "SQL", "OOP", "HTML/CSS/JS basics", "Communication"],
    rounds: ["Communication (Versant) Round", "Aptitude + Gamified Reasoning Round", "Technical Assessment (Coding + SQL + Web Dev)", "Technical + HR Interview (Combined)"],
    difficulty: "Easy",
    questions: [
      { question: "Explain the four pillars of OOP with real-world examples (Polymorphism, Inheritance, Encapsulation, Abstraction)", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Difference between SQL and MySQL", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Write a SQL query using an INNER JOIN", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Why are interfaces preferred over abstract classes in Java?", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Explain exception handling in Java and the purpose of the Object class", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Write a program to count the even integers in an array", difficulty: "Easy", round: "Technical Assessment (Coding + SQL + Web Dev)" },
      { question: "What are the drawbacks and benefits of working in a team?", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Are you willing to relocate and work in rotational/night shifts?", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
    ]
  },
  {
    name: "Accenture",
    description: "Accenture ASE/AASE hiring — Cognitive & Technical Assessment (90 questions: Verbal, Reasoning, Pseudocode, Networking/Cloud/Security, MS Office), 2 Coding questions (Easy-Medium), non-eliminatory Communication Assessment, then a combined Technical + HR interview centered on the resume and major project.",
    requiredSkills: ["Any Programming Language", "Communication", "Problem Solving", "Networking/Cloud basics"],
    rounds: ["Cognitive & Technical Assessment", "Coding Assessment", "Communication Assessment (Non-Elimination)", "Technical + HR Interview (Combined)"],
    difficulty: "Easy",
    questions: [
      { question: "Write a program to print all prime numbers up to a given number", difficulty: "Easy", round: "Coding Assessment" },
      { question: "Check if two strings are anagrams of each other", difficulty: "Easy", round: "Coding Assessment" },
      { question: "Given a string, return a new string formatted as: first character + length of string + last character", difficulty: "Easy", round: "Coding Assessment" },
      { question: "Explain the differences between HTML, CSS, and JavaScript", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
      { question: "Explain your major project in detail — why this tech stack, your specific contribution", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "If a teammate isn't completing their task on time, how would you handle it?", difficulty: "Medium", round: "Technical + HR Interview (Combined)" },
      { question: "Why Accenture? What do you know about the company and its technology landscape?", difficulty: "Easy", round: "Technical + HR Interview (Combined)" },
    ]
  },
  {
    name: "Amazon",
    description: "Amazon SDE-1 (Fresher) hiring — Online Assessment with 2 DSA problems (medium-hard) + work-style assessment, followed by 2-3 technical interview rounds (DSA + LLD/System Design) and a Bar Raiser round centered entirely on Leadership Principles.",
    requiredSkills: ["DSA (Trees, Graphs, Linked List, DP)", "System Design Basics", "Java/C++/Python", "Leadership Principles"],
    rounds: ["Online Assessment (2 DSA problems + Work Style)", "Technical Round 1 (DSA)", "Technical Round 2 (DSA/LLD)", "Bar Raiser Round (Leadership Principles)"],
    difficulty: "Hard",
    questions: [
      { question: "Given a string, find its first non-repeating character", difficulty: "Easy", round: "Technical Round 1 (DSA)" },
      { question: "Given a list of strings, group the anagrams together", difficulty: "Medium", round: "Technical Round 1 (DSA)" },
      { question: "Sort an array of 0s, 1s, and 2s (Dutch National Flag problem)", difficulty: "Medium", round: "Technical Round 1 (DSA)" },
      { question: "Convert a given binary tree to a Sum Tree", difficulty: "Medium", round: "Technical Round 2 (DSA/LLD)" },
      { question: "Trapping Rain Water problem", difficulty: "Hard", round: "Technical Round 2 (DSA/LLD)" },
      { question: "Design a parking lot system (OOP-based LLD)", difficulty: "Hard", round: "Technical Round 2 (DSA/LLD)" },
      { question: "Implement an LRU Cache using Interfaces and Generics", difficulty: "Hard", round: "Technical Round 2 (DSA/LLD)" },
      { question: "Tell me about a time you went above and beyond your job responsibilities (Ownership)", difficulty: "Medium", round: "Bar Raiser Round (Leadership Principles)" },
      { question: "Tell me about a time you received negative feedback from a manager — how did you respond? (Earn Trust)", difficulty: "Medium", round: "Bar Raiser Round (Leadership Principles)" },
      { question: "Describe a situation where you disagreed with a teammate and how you resolved it (Have Backbone; Disagree and Commit)", difficulty: "Medium", round: "Bar Raiser Round (Leadership Principles)" },
    ]
  },
  {
    name: "Hexaware",
    description: "Hexaware GET/PGET hiring — Online Aptitude + Domain test (Pseudocode, Computer Fundamentals), Group Discussion, Coding Assessment (2 questions), Effective Communication (EC) interview covering technical + HR + project discussion.",
    requiredSkills: ["Java/Python/C++", "DSA basics", "SQL", "Aptitude", "Communication"],
    rounds: ["Online Aptitude + Domain Test", "Group Discussion", "Coding Assessment", "EC Interview (Technical + HR Combined)"],
    difficulty: "Easy",
    questions: [
      { question: "Explain your final year project in detail", difficulty: "Medium", round: "EC Interview (Technical + HR Combined)" },
      { question: "Do you know SDLC models? Explain them", difficulty: "Easy", round: "EC Interview (Technical + HR Combined)" },
      { question: "Rate yourself in DBMS and explain your reasoning", difficulty: "Easy", round: "EC Interview (Technical + HR Combined)" },
      { question: "Write a SQL query to find the 3rd last score from a class table", difficulty: "Medium", round: "EC Interview (Technical + HR Combined)" },
      { question: "Write a program to print alternate prime numbers", difficulty: "Medium", round: "Coding Assessment" },
      { question: "Are you aware of the company bond and salary structure?", difficulty: "Easy", round: "EC Interview (Technical + HR Combined)" },
      { question: "Group Discussion topic: 'Impact of AI on employment'", difficulty: "Medium", round: "Group Discussion" },
    ]
  },
  {
    name: "Persistent Systems",
    description: "Persistent Systems hiring — MCQ round covering DSA, DBMS, OS, Computer Networks; Advanced Coding round (1-2 medium DSA/DP problems); 2 Technical Interview rounds (OOP, projects, live coding); HR round. Known as more technically rigorous than typical service companies.",
    requiredSkills: ["Java/C++", "DSA (Linked List, Trees, DP)", "DBMS", "Operating Systems", "OOP"],
    rounds: ["MCQ Round (DSA + DBMS + OS + Networks)", "Advanced Coding Round", "Technical Interview Round 1", "Technical Interview Round 2", "HR Round"],
    difficulty: "Medium",
    questions: [
      { question: "What is the difference between method overloading and method overriding?", difficulty: "Easy", round: "Technical Interview Round 1" },
      { question: "What are access specifiers? Explain public, private, and protected", difficulty: "Easy", round: "Technical Interview Round 1" },
      { question: "Explain runtime polymorphism vs compile-time polymorphism", difficulty: "Medium", round: "Technical Interview Round 1" },
      { question: "Explain operations on a linked list — insertion, deletion, reversal, cycle detection", difficulty: "Medium", round: "Technical Interview Round 2" },
      { question: "Explain tree traversals (in-order, pre-order, post-order) and balancing in AVL trees", difficulty: "Hard", round: "Technical Interview Round 2" },
      { question: "Solve a Dynamic Programming problem — Longest Common Subsequence or Knapsack", difficulty: "Hard", round: "Advanced Coding Round" },
      { question: "Explain deadlock in operating systems and how to avoid it", difficulty: "Medium", round: "Technical Interview Round 1" },
      { question: "Explain your project in detail — approach, technologies used, and how it would scale", difficulty: "Medium", round: "Technical Interview Round 1" },
    ]
  },
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