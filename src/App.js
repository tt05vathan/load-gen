import React, { useState, useEffect, useRef } from 'react';
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

  // Touch/swipe state
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;

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

  // Navigation functions
  const goToNextPage = async () => {
    if (loading) return;
    setNavigationDirection('right');
    setNavigationKey(prev => prev + 1);
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Create new page if at the end
      const newPageIndex = await createNewPage();
      setCurrentPage(newPageIndex);
    }
  };

  const goToPreviousPage = () => {
    if (loading || currentPage <= 0) return;
    setNavigationDirection('left');
    setNavigationKey(prev => prev + 1);
    setCurrentPage(currentPage - 1);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e) => {
    // Don't handle swipe if touching textarea or input
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextPage();
    } else if (isRightSwipe) {
      goToPreviousPage();
    }

    // Reset touch state
    touchStartX.current = null;
    touchEndX.current = null;
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
        goToNextPage();
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        e.preventDefault();
        goToPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div
      className="App"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        canGoPrevious={currentPage > 0}
        canGoNext={true}
      />
      <div className="navigation-hint">
        <p>Swipe or use ← → to navigate</p>
        <p>Page {currentPage + 1} of {pages.length}</p>
      </div>
    </div>
  );
}

export default App;