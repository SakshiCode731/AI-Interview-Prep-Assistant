import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

import aiLogo from '../assets/ai-logo.png';

const CompanyPrep = () => {
  const [companies, setCompanies] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');   // ✅
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const fetchCompanies = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/companies${keyword ? `?search=${keyword}` : ''}`);
      setCompanies(res.data);

      // Agar sirf ek hi company match hui aur search se aaye hain, toh auto-select karo
      if (keyword && res.data.length === 1) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // handleSearch ko simple rakho — sirf state update
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Debounce: 400ms rukne ke baad hi API call ho
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCompanies(search);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'text-green-400 bg-green-900/30 border-green-800';
    if (d === 'Medium') return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={aiLogo} alt="PrepAI logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-purple-400">PrepAI</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">🏢 Company-wise Preparation</h2>
        <p className="text-gray-400 mb-8">Select a company to see interview rounds, questions and required skills</p>

        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search company — TCS, Amazon, Infosys..."
            value={search}
            onChange={handleSearch}
            className="w-full px-5 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-base"
          />
          <span className="absolute right-5 top-4 text-gray-500 text-xl">🔍</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Company List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">
              {loading ? 'Searching...' : `${companies.length} companies found`}
            </h3>
            {companies.map((company) => (
              <div
                key={company._id}
                onClick={() => setSelected(company)}
                className={`bg-gray-900 border rounded-2xl p-4 cursor-pointer transition ${selected?._id === company._id
                  ? 'border-purple-500 bg-purple-900/10'
                  : 'border-gray-800 hover:border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{company.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColor(company.difficulty)}`}>
                    {company.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{company.description}</p>
                <div className="flex flex-wrap gap-1">
                  {company.requiredSkills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {company.requiredSkills.length > 3 && (
                    <span className="text-xs text-gray-500">+{company.requiredSkills.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Company Detail */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold mb-2">Select a company</h3>
                <p className="text-gray-400">Click any company from the left to see detailed preparation guide</p>
              </div>
            ) : (
              <div className="space-y-5">

                {/* Company Header */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold">{selected.name}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full border ${difficultyColor(selected.difficulty)}`}>
                      {selected.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-5">{selected.description}</p>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.requiredSkills.map((skill, i) => (
                        <span key={i} className="bg-purple-900/30 border border-purple-800 text-purple-300 text-sm px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Start Company Mock Interview */}
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-700 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-1">🎯 Company-Specific Mock Interview</h4>
                    <p className="text-gray-400 text-sm">Practice with {selected.name}'s actual interview pattern — {selected.questions.length} real questions across {selected.rounds.length} rounds</p>
                  </div>
                  <button
                    onClick={() => navigate(`/company-mock/${selected._id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition flex-shrink-0"
                  >
                    Start Interview →
                  </button>
                </div>

                {/* Interview Rounds */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Interview Rounds</h4>
                  <div className="flex flex-col gap-3">
                    {selected.rounds.map((round, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-700 flex items-center justify-center text-purple-400 text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-gray-800 rounded-xl px-4 py-2.5">
                          <span className="text-white text-sm">{round}</span>
                        </div>
                        {i < selected.rounds.length - 1 && (
                          <div className="absolute ml-4 mt-8 w-0.5 h-3 bg-gray-700"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Previous Questions */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">
                    Previous Interview Questions ({selected.questions.length})
                  </h4>
                  <div className="space-y-3">
                    {selected.questions.map((q, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">Q{i + 1}</span>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                              {q.round}
                            </span>
                          </div>
                        </div>
                        <p className="text-white text-sm leading-relaxed">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPrep;