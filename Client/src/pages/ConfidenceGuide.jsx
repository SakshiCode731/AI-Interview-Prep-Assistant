import { useNavigate } from 'react-router-dom';

const tips = [
  {
    icon: '🧘',
    title: 'Deep Breathing Exercise',
    color: 'blue',
    points: [
      'Practice this 10 minutes before your interview',
      '4 sec inhale → 4 sec hold → 4 sec exhale',
      'Repeat 5-6 times',
      'Slows your heart rate and reduces anxiety',
    ]
  },
  {
    icon: '🧠',
    title: 'Mental Preparation',
    color: 'purple',
    points: [
      'Get proper sleep the night before — 7-8 hours',
      'Take a short walk or stretch in the morning',
      'Mentally review your achievements and projects once',
      'Tell yourself "I am ready" — repeat it with confidence',
    ]
  },
  {
    icon: '🚫',
    title: 'Stop Overthinking',
    color: 'red',
    points: [
      'Do not imagine worst case scenarios',
      'If you don\'t know an answer — it\'s okay, move on',
      'The interviewer is not your enemy — they want you to succeed',
      'Focus on what you know, not what you don\'t',
    ]
  },
  {
    icon: '💪',
    title: 'Confidence Building Tips',
    color: 'green',
    points: [
      'Practice in front of a mirror — ask yourself questions',
      'Power pose — stand in a strong pose alone for 2 minutes before entering',
      'Review your achievements, projects, and skills once',
      'Do a mock interview — with a friend or using PrepAI',
    ]
  },
  {
    icon: '🚪',
    title: 'How to Enter the Interview Room',
    color: 'yellow',
    points: [
      'Knock on the door — enter only after permission',
      'Smile genuinely — not forcefully',
      'Stand straight — shoulders back',
      'Greet with "Good morning/afternoon sir/ma\'am"',
      'Ask permission before sitting — "May I sit?"',
    ]
  },
  {
    icon: '👁️',
    title: 'Body Language & Eye Contact',
    color: 'pink',
    points: [
      'Maintain eye contact — but do not stare',
      'Do not fold your arms — keep open body language',
      'Speak slowly and clearly — do not rush',
      'Nod when the interviewer speaks — show engagement',
      'Avoid fidgeting — do not click pens or shake your leg',
    ]
  },
];

const colorMap = {
  blue: 'border-blue-800 bg-blue-900/10 text-blue-400',
  purple: 'border-purple-800 bg-purple-900/10 text-purple-400',
  red: 'border-red-800 bg-red-900/10 text-red-400',
  green: 'border-green-800 bg-green-900/10 text-green-400',
  yellow: 'border-yellow-800 bg-yellow-900/10 text-yellow-400',
  pink: 'border-pink-800 bg-pink-900/10 text-pink-400',
};

const ConfidenceGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-purple-400">PrepAI</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">🧘 Confidence & Calmness Guide</h2>
        <p className="text-gray-400 mb-10">Walk into every interview calm, confident, and fully prepared</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tips.map((tip, i) => (
            <div key={i} className={`border rounded-2xl p-6 ${colorMap[tip.color]}`}>
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h3 className="font-bold text-lg text-white mb-4">{tip.title}</h3>
              <ul className="space-y-2">
                {tip.points.map((point, j) => (
                  <li key={j} className="text-gray-300 text-sm flex gap-2">
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-purple-900/20 border border-purple-700 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🌟</p>
          <p className="text-purple-300 font-semibold text-lg mb-2">
            "Preparation + Confidence = Success"
          </p>
          <p className="text-gray-400 text-sm">
            You are putting in the effort — that itself is a big deal. In the interview, just show what you already know!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceGuide;