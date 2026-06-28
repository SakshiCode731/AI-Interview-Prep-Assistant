import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const maleData = {
  dos: [
    "👔 Formal shirt — light colors (white, light blue, pastel)",
    "👖 Dark formal trousers — navy, black, charcoal",
    "👞 Polished formal shoes — black or brown",
    "🧥 Blazer optional but adds professionalism",
    "⌚ Simple watch — no flashy accessories",
    "✂️ Hair neatly combed, clean shave or trimmed beard",
    "🧴 Light cologne — not too strong",
    "🎽 Clothes properly ironed and wrinkle-free",
  ],
  donts: [
    "❌ No casual t-shirts, jeans, or sneakers",
    "❌ No loud prints or bright neon colors",
    "❌ No torn, wrinkled, or stained clothes",
    "❌ No heavy chains or flashy jewellery",
    "❌ No strong perfume — can be distracting",
    "❌ No cap or hat inside interview room",
    "❌ No earphones or smartwatch on wrist during interview",
    "❌ No untucked shirt",
  ],
  tips: [
    "🌟 Iron your clothes the night before",
    "🌟 Keep a spare handkerchief",
    "🌟 Trim nails — interviewers notice details",
    "🌟 Wear well-fitted clothes — not too tight or too loose",
    "🌟 Carry a neat folder or bag for documents",
  ]
};

const femaleData = {
  dos: [
    "👗 Formal salwar suit — solid, subtle colors",
    "👔 OR formal shirt with trousers — navy, black, grey",
    "🥻 Saree also acceptable for corporate interviews",
    "👠 Formal sandals or closed-toe shoes — low heels",
    "💍 Minimal jewellery — small earrings, simple necklace",
    "💼 Neat dupatta if wearing suit — properly pinned",
    "💄 Light natural makeup — no heavy or bold look",
    "💇 Hair neatly tied or set — no messy open hair",
  ],
  donts: [
    "❌ No casual kurtis, leggings, or jeans",
    "❌ No sleeveless or revealing outfits",
    "❌ No heavy jewellery or bangles that make noise",
    "❌ No very bright or neon colors",
    "❌ No heavy perfume or strong body spray",
    "❌ No wrinkled or stained clothes",
    "❌ No very high heels — comfort matters",
    "❌ No bold lipstick or heavy eye makeup",
  ],
  tips: [
    "🌟 Keep dupatta properly pinned to avoid distractions",
    "🌟 Natural makeup looks more professional",
    "🌟 Carry a formal handbag or folder",
    "🌟 Wear comfortable footwear — you may have to walk a lot",
    "🌟 Keep hair tied — shows seriousness and focus",
  ]
};

const DressingGuide = () => {
  const [tab, setTab] = useState('male');
  const navigate = useNavigate();
  const data = tab === 'male' ? maleData : femaleData;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
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
        <h2 className="text-3xl font-bold mb-2">👔 Interview Dressing Guide</h2>
        <p className="text-gray-400 mb-8">First impressions matter — dress to impress and show professionalism</p>

        {/* Tab Switch */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab('male')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
              tab === 'male'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👨 Male
          </button>
          <button
            onClick={() => setTab('female')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
              tab === 'female'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👩 Female
          </button>
        </div>

        <div className="space-y-6">
          {/* Do's */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-green-400 font-bold text-lg mb-4">✅ Do's — What to Wear</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.dos.map((item, i) => (
                <div key={i} className="bg-green-900/10 border border-green-900/30 rounded-xl px-4 py-3 text-sm text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Don'ts */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold text-lg mb-4">❌ Don'ts — What to Avoid</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.donts.map((item, i) => (
                <div key={i} className="bg-red-900/10 border border-red-900/30 rounded-xl px-4 py-3 text-sm text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">💡 Pro Tips</h3>
            <div className="space-y-3">
              {data.tips.map((tip, i) => (
                <div key={i} className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl px-4 py-3 text-sm text-gray-200">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Reminder Card */}
          <div className="bg-purple-900/20 border border-purple-700 rounded-2xl p-6 text-center">
            <p className="text-purple-300 font-semibold text-lg mb-2">
              👑 Remember — Confidence is your best outfit!
            </p>
            <p className="text-gray-400 text-sm">
              Wear clean, well-fitted, ironed clothes. When you look good, you feel good — and it shows in your interview!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressingGuide;