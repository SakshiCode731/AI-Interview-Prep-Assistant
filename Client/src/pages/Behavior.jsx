import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    id: 'entry',
    icon: '🚪',
    title: 'Entering the Interview Room',
    steps: [
      { step: '01', title: 'Knock before entering', desc: 'Knock 2-3 times on the door. Enter only after receiving permission.' },
      { step: '02', title: 'Greet professionally', desc: 'Say "Good morning/afternoon sir/ma\'am" with a smile. Keep your energy positive.' },
      { step: '03', title: 'Introduce yourself', desc: 'Say "I am [Name], here for the [Role] interview." — speak in a confident tone.' },
      { step: '04', title: 'Ask permission to sit', desc: '"May I sit?" — this small gesture shows professionalism and respect.' },
      { step: '05', title: 'Sit upright', desc: 'Sit straight on the chair — do not lean back or sit cross-legged.' },
    ]
  },
  {
    id: 'communication',
    icon: '🗣️',
    title: 'Communication Tips',
    steps: [
      { step: '01', title: 'Speak slowly and clearly', desc: 'People tend to speak fast when nervous — consciously slow down your pace.' },
      { step: '02', title: 'Think before you speak', desc: 'If you don\'t know the answer — saying "Let me think for a moment" is completely acceptable.' },
      { step: '03', title: 'Answer in complete sentences', desc: 'Don\'t just say "Yes" or "No" — explain your answer with relevant examples.' },
      { step: '04', title: 'Do not interrupt', desc: 'Listen to the interviewer\'s complete question before answering — never speak over them.' },
      { step: '05', title: 'Use positive language', desc: 'Instead of "I don\'t know", say "I\'m still learning this, but what I do know is..."' },
    ]
  },
  {
    id: 'bodylanguage',
    icon: '🤝',
    title: 'Body Language',
    steps: [
      { step: '01', title: 'Maintain eye contact', desc: 'Look directly at the interviewer — but don\'t stare. Keep it natural and comfortable.' },
      { step: '02', title: 'Open body language', desc: 'Do not fold your arms — keep your hands relaxed on the table or in your lap.' },
      { step: '03', title: 'Nod while listening', desc: 'When the interviewer is speaking — nod occasionally to show you are engaged.' },
      { step: '04', title: 'Avoid fidgeting', desc: 'Do not click pens, tap the table, or shake your leg — these signal nervousness.' },
      { step: '05', title: 'Smile genuinely', desc: 'Do not force a smile — a natural, confident smile leaves the best impression.' },
    ]
  },
  {
    id: 'mistakes',
    icon: '⚠️',
    title: 'Common Mistakes — Avoid These',
    steps: [
      { step: '❌', title: 'Forgetting to silence your phone', desc: 'Put your phone on silent or switch it off before the interview. A ringing phone is the worst impression.' },
      { step: '❌', title: 'Arriving late', desc: 'Arrive 10-15 minutes early — traffic is never an acceptable excuse to an interviewer.' },
      { step: '❌', title: 'Not researching the company', desc: '"Tell me about our company" is always asked. Research the company beforehand — no exceptions.' },
      { step: '❌', title: 'Speaking negatively about past experiences', desc: 'Never speak badly about your previous college, teachers, or internship companies.' },
      { step: '❌', title: 'Being overconfident or underconfident', desc: 'Strike a balance — don\'t boast, don\'t undersell yourself. Stay grounded and honest.' },
    ]
  },
];

const BehaviorGuide = () => {
  const [active, setActive] = useState('entry');
  const navigate = useNavigate();
  const current = sections.find(s => s.id === active);

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

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">🤝 Interview Behavior Guide</h2>
        <p className="text-gray-400 mb-8">How to behave, communicate, and present yourself in interviews</p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                active === s.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s.icon} {s.title.split(' ').slice(0, 3).join(' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>{current.icon}</span>
            <span>{current.title}</span>
          </h3>
          <div className="space-y-4">
            {current.steps.map((item, i) => (
              <div key={i} className="flex gap-4 bg-gray-800 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-700 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reminder */}
        <div className="mt-6 bg-purple-900/20 border border-purple-700 rounded-2xl p-5 text-center">
          <p className="text-purple-300 font-semibold">
            💡 Golden Rule — "Be yourself, be prepared, be respectful."
          </p>
        </div>
      </div>
    </div>
  );
};

export default BehaviorGuide;