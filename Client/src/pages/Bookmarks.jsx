import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';

const Bookmarks = () => {
  const { bookmarks, removeBookmark } = useBookmarks();
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
        <h2 className="text-3xl font-bold mb-2">🔖 Bookmarks</h2>
        <p className="text-gray-400 mb-8">Your saved questions and companies — all in one place</p>

        {bookmarks.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-gray-400">Bookmark questions or companies while practicing — they'll show up here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((item) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-xs bg-purple-900/40 border border-purple-700 text-purple-300 px-2 py-0.5 rounded-full mb-2 inline-block">
                    {item.type}
                  </span>
                  <p className="text-white text-sm">{item.text}</p>
                  {item.meta && <p className="text-gray-400 text-xs mt-1">{item.meta}</p>}
                </div>
                <button
                  onClick={() => removeBookmark(item.id)}
                  className="text-red-400 hover:text-red-300 text-sm ml-4 flex-shrink-0"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;