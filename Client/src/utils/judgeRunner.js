export function runTestCases(userCode, testCases) {
  const results = [];

  let userFunction;
  try {
    // Wrap user code in a function scope and extract `solve`
    const wrapper = new Function(`
      ${userCode}
      return solve;
    `);
    userFunction = wrapper();
  } catch (err) {
    return testCases.map((tc) => ({
      input: tc.input,
      expected: tc.expected,
      actual: null,
      passed: false,
      error: "Syntax Error: " + err.message
    }));
  }

  for (const tc of testCases) {
    try {
      const actual = userFunction(tc.input);
      const passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual,
        passed,
        error: null
      });
    } catch (err) {
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: null,
        passed: false,
        error: "Runtime Error: " + err.message
      });
    }
  }

  return results;
}