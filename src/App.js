import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import MessagePage from './components/MessagePage';
import { pagesAPI } from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [navigationDirection, setNavigationDirection] = useState('right');
  const [navigationKey, setNavigationKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load pages from database
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const pagesData = await pagesAPI.getAll();
      setPages(pagesData);
      setError(null);
    } catch (err) {
      console.error('Failed to load pages:', err);
      setError('Failed to load pages. Using offline mode.');
      // Fallback to localStorage if server is down
      const savedPages = localStorage.getItem('birthdayPages');
      if (savedPages) {
        setPages(JSON.parse(savedPages));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save pages to database (and localStorage as backup)
  const savePages = async (updatedPages) => {
    try {
      // Save to localStorage as backup
      localStorage.setItem('birthdayPages', JSON.stringify(updatedPages));
      setPages(updatedPages);
    } catch (err) {
      console.error('Failed to save pages:', err);
      setError('Failed to save changes.');
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (showWelcome || loading) return;
      
      // Don't navigate if user is typing in textarea or any input field
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'INPUT' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setNavigationDirection('right');
        setNavigationKey(prev => prev + 1); // Trigger animation
        if (currentPage < pages.length - 1) {
          setCurrentPage(currentPage + 1);
        } else {
          // Create new page if at the end
          const newPageIndex = await createNewPage();
          setCurrentPage(newPageIndex);
        }
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        e.preventDefault();
        setNavigationDirection('left');
        setNavigationKey(prev => prev + 1); // Trigger animation
        setCurrentPage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages, showWelcome, loading]);

  const handleStart = async () => {
    setShowWelcome(false);
    if (pages.length === 0) {
      try {
        // Create first page in database
        const firstPage = await pagesAPI.create({
          text: 'Welcome to your birthday surprise! 💕\n\nThis is where your special messages will appear...\n\nUse arrow keys to navigate through all the love I have for you! 🎂',
          image: null
        });
        setPages([firstPage]);
        setCurrentPage(0);
      } catch (err) {
        console.error('Failed to create first page:', err);
        // Fallback to local creation
        const firstPage = { 
          id: Date.now(), 
          text: 'Welcome to your birthday surprise! 💕\n\nThis is where your special messages will appear...\n\nUse arrow keys to navigate through all the love I have for you! 🎂', 
          image: null 
        };
        setPages([firstPage]);
        setCurrentPage(0);
      }
    }
  };

  const updatePage = async (pageIndex, updatedData) => {
    try {
      const pageToUpdate = pages[pageIndex];
      const updatedPage = await pagesAPI.update(pageToUpdate.id, {
        ...pageToUpdate,
        ...updatedData
      });
      
      const updatedPages = [...pages];
      updatedPages[pageIndex] = updatedPage;
      await savePages(updatedPages);
    } catch (err) {
      console.error('Failed to update page:', err);
      // Fallback to local update
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...updatedPages[pageIndex], ...updatedData };
      setPages(updatedPages);
      localStorage.setItem('birthdayPages', JSON.stringify(updatedPages));
    }
  };

  const createNewPage = async () => {
    try {
      const newPage = await pagesAPI.create({
        text: '',
        image: null
      });
      const updatedPages = [...pages, newPage];
      await savePages(updatedPages);
      return updatedPages.length - 1; // Return new page index
    } catch (err) {
      console.error('Failed to create new page:', err);
      // Fallback to local creation
      const newPage = { id: Date.now(), text: '', image: null };
      const updatedPages = [...pages, newPage];
      setPages(updatedPages);
      localStorage.setItem('birthdayPages', JSON.stringify(updatedPages));
      return updatedPages.length - 1;
    }
  };

  if (showWelcome) {
    return <WelcomePage onStart={handleStart} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>💕 Loading your memories... 💕</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}
      <MessagePage
        page={pages[currentPage]}
        pageNumber={currentPage + 1}
        totalPages={pages.length}
        onUpdatePage={(data) => updatePage(currentPage, data)}
        direction={navigationDirection}
        navigationKey={navigationKey}
      />
      <div className="navigation-hint">
        <p>Use ← → arrow keys to navigate</p>
        <p>Page {currentPage + 1} of {pages.length}</p>
      </div>
    </div>
  );
}

export default App;