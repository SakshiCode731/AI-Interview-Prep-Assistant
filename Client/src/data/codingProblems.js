export const codingProblems = [
  {
    id: 1,
    title: "Reverse a String",
    difficulty: "Easy",
    description: "Write a function `solve(str)` that returns the reversed string.",
    starterCode: `function solve(str) {\n  // your code here\n}`,
    testCases: [
      { input: "hello", expected: "olleh" },
      { input: "world", expected: "dlrow" },
      { input: "a", expected: "a" }
    ]
  },
  {
    id: 2,
    title: "Find Maximum in Array",
    difficulty: "Easy",
    description: "Write a function `solve(arr)` that returns the maximum number in the array.",
    starterCode: `function solve(arr) {\n  // your code here\n}`,
    testCases: [
      { input: [1, 5, 3], expected: 5 },
      { input: [-2, -1, -8], expected: -1 },
      { input: [10], expected: 10 }
    ]
  },
  {
    id: 3,
    title: "Check Palindrome",
    difficulty: "Easy",
    description: "Write a function `solve(str)` that returns true if the string is a palindrome.",
    starterCode: `function solve(str) {\n  // your code here\n}`,
    testCases: [
      { input: "madam", expected: true },
      { input: "hello", expected: false },
      { input: "racecar", expected: true }
    ]
  },
  {
    id: 4,
    title: "Sum of Array",
    difficulty: "Easy",
    description: "Write a function `solve(arr)` that returns the sum of all numbers.",
    starterCode: `function solve(arr) {\n  // your code here\n}`,
    testCases: [
      { input: [1, 2, 3], expected: 6 },
      { input: [-1, 1], expected: 0 },
      { input: [5], expected: 5 }
    ]
  },
  {
    id: 5,
    title: "FizzBuzz Single Value",
    difficulty: "Medium",
    description: "Write a function `solve(n)` that returns 'Fizz' if divisible by 3, 'Buzz' if by 5, 'FizzBuzz' if both, else the number as string.",
    starterCode: `function solve(n) {\n  // your code here\n}`,
    testCases: [
      { input: 3, expected: "Fizz" },
      { input: 5, expected: "Buzz" },
      { input: 15, expected: "FizzBuzz" },
      { input: 7, expected: "7" }
    ]
  }
];