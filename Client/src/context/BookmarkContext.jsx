import { createContext, useContext, useState, useEffect } from 'react';

const BookmarkContext = createContext();

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('prepai_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prepai_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (item) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBookmark = (item) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === item.id);
      if (exists) return prev.filter((b) => b.id !== item.id);
      return [...prev, item];
    });
  };

  const isBookmarked = (id) => bookmarks.some((b) => b.id === id);

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};