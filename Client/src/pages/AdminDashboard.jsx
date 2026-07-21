import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const emptyCompany = {
  name: '',
  description: '',
  requiredSkills: '',
  rounds: '',
  difficulty: 'Easy',
  questions: [{ question: '', difficulty: 'Easy', round: '' }],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCompany);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await API.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      setError('Could not load companies');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyCompany);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (company) => {
    setForm({
      name: company.name,
      description: company.description,
      requiredSkills: company.requiredSkills.join(', '),
      rounds: company.rounds.join(', '),
      difficulty: company.difficulty,
      questions: company.questions.length ? company.questions : [{ question: '', difficulty: 'Easy', round: '' }],
    });
    setEditingId(company._id);
    setShowForm(true);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...form.questions];
    updated[index][field] = value;
    setForm({ ...form, questions: updated });
  };

  const addQuestionField = () => {
    setForm({ ...form, questions: [...form.questions, { question: '', difficulty: 'Easy', round: '' }] });
  };

  const removeQuestionField = (index) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      description: form.description,
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      rounds: form.rounds.split(',').map((r) => r.trim()).filter(Boolean),
      difficulty: form.difficulty,
      questions: form.questions.filter((q) => q.question.trim()),
    };

    try {
      if (editingId) {
        await API.put(`/companies/${editingId}`, payload);
      } else {
        await API.post('/companies', payload);
      }
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await API.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      setError('Delete failed');
    }
  };

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'text-green-400 bg-green-900/30 border-green-800';
    if (d === 'Medium') return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-purple-400">PrepAI Admin</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-1">🛠️ Admin — Manage Companies</h2>
            <p className="text-gray-400 text-sm">Add, edit, or remove company interview data</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            + Add Company
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Company List */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {companies.map((c) => (
              <div key={c._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-1">{c.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{c.questions.length} questions · {c.rounds.length} rounds</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditForm(c)}
                    className="px-4 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/30 rounded-xl text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
                <h3 className="text-xl font-bold">{editingId ? 'Edit Company' : 'Add New Company'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Company Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    value={form.requiredSkills}
                    onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                    placeholder="Java, DSA, SQL"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Rounds (comma separated)</label>
                  <input
                    type="text"
                    value={form.rounds}
                    onChange={(e) => setForm({ ...form, rounds: e.target.value })}
                    placeholder="Online Test, Technical Interview, HR Round"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Questions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-gray-400">Interview Questions</label>
                    <button onClick={addQuestionField} className="text-purple-400 text-xs hover:underline">+ Add Question</button>
                  </div>
                  <div className="space-y-3">
                    {form.questions.map((q, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-3 space-y-2">
                        <textarea
                          value={q.question}
                          onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
                          placeholder="Question text"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 text-sm focus:outline-none focus:border-purple-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={q.difficulty}
                            onChange={(e) => handleQuestionChange(i, 'difficulty', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 text-sm focus:outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                          <input
                            type="text"
                            value={q.round}
                            onChange={(e) => handleQuestionChange(i, 'round', e.target.value)}
                            placeholder="Round name"
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => removeQuestionField(i)}
                            className="px-3 text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <div className="p-6 border-t border-gray-800 flex gap-3 sticky bottom-0 bg-gray-900">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;