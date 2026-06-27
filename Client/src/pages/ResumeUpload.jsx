import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedText(res.data.text);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-purple-400">PrepAI</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-2">📄 Resume Upload</h2>
        <p className="text-gray-400 text-center mb-8">Upload your PDF resume to extract text</p>

        {/* Upload Box */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-gray-400 mb-4"
          />

          {file && (
            <p className="text-green-400 text-sm mb-4">
              ✅ Selected: {file.name}
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>

        {/* Extracted Text */}
        {extractedText && (
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">
              Extracted Text:
            </h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {extractedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;