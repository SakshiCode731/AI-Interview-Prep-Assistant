import { useState } from "react";
import { codingProblems } from "../data/codingProblems";
import { runTestCases } from "../utils/judgeRunner";

export default function CodingRound() {
  const [selectedProblem, setSelectedProblem] = useState(codingProblems[0]);
  const [code, setCode] = useState(codingProblems[0].starterCode);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const handleProblemChange = (problem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode);
    setResults(null);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runTestCases(code, selectedProblem.testCases);
      setResults(res);
      setRunning(false);
    }, 300); // small delay for UX, feels like "running"
  };

  const passedCount = results ? results.filter((r) => r.passed).length : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Coding Round Practice</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Problem List */}
        <div className="col-span-1 space-y-2">
          {codingProblems.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProblemChange(p)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                selectedProblem.id === p.id
                  ? "bg-purple-600 border-purple-500"
                  : "bg-gray-900 border-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-gray-400">{p.difficulty}</div>
            </button>
          ))}
        </div>

        {/* Editor + Results */}
        <div className="col-span-3 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-1">{selectedProblem.title}</h2>
            <p className="text-gray-400 text-sm mb-3">{selectedProblem.description}</p>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-56 bg-gray-950 border border-gray-700 rounded-lg p-3 font-mono text-sm text-green-400 focus:outline-none focus:border-purple-500"
            />

            <button
              onClick={handleRun}
              disabled={running}
              className="mt-3 px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {running ? "Running..." : "▶ Run Tests"}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Test Results</h3>
                <span
                  className={`text-sm font-bold ${
                    passedCount === results.length ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {passedCount}/{results.length} Passed
                </span>
              </div>

              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-sm font-mono ${
                      r.passed
                        ? "bg-green-950/40 border-green-800"
                        : "bg-red-950/40 border-red-800"
                    }`}
                  >
                    <div>Input: {JSON.stringify(r.input)}</div>
                    <div>Expected: {JSON.stringify(r.expected)}</div>
                    <div>Got: {r.error ? r.error : JSON.stringify(r.actual)}</div>
                    <div className={r.passed ? "text-green-400" : "text-red-400"}>
                      {r.passed ? "✅ Passed" : "❌ Failed"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}