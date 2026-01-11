import React, { useState, useRef, useEffect } from 'react';
import { imageUtils } from '../services/api';
import './MessagePage.css';

const MessagePage = ({
  page,
  pageNumber,
  totalPages,
  onUpdatePage,
  direction = 'right',
  navigationKey,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}) => {
  const [text, setText] = useState(page?.text || '');
  const [image, setImage] = useState(page?.image || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Update local state when page prop changes (navigation)
  useEffect(() => {
    setText(page?.text || '');
    setImage(page?.image || null);
  }, [page]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onUpdatePage({ text: newText });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      // Enhanced validation with security checks
      await imageUtils.validateImage(file);

      // Compress image for better performance
      const compressedFile = await imageUtils.compressImage(file);

      // Convert to Base64
      const imageData = await imageUtils.fileToBase64(compressedFile);

      setImage(imageData);
      onUpdatePage({ image: imageData });
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    setUploadError(null);
    onUpdatePage({ image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreviousClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canGoPrevious && onPrevious) {
      onPrevious();
    }
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="message-page">
      <div className="page-header">
        <h2>💕 Memory {pageNumber} 💕</h2>
      </div>

      <div className="card-container">
        <div key={navigationKey} className={`memory-card slide-from-${direction}`}>
          <div className="card-content">
            <div className="image-section">
              <div className="image-container" onClick={handleImageClick}>
                {uploading ? (
                  <div className="upload-loading">
                    <div className="upload-spinner"></div>
                    <p>Uploading image...</p>
                  </div>
                ) : image ? (
                  <div className="image-wrapper">
                    <img src={image} alt="Memory" className="uploaded-image" />
                    <button className="remove-image" onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>Click to add a photo</p>
                    <p className="upload-hint">Make this memory visual! 💕</p>
                    {uploadError && (
                      <p className="upload-error">❌ {uploadError}</p>
                    )}
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>

            <div className="text-section">
              <h3>Your Message 💌</h3>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Write your heartfelt message here... 💖"
                className="message-textarea"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="page-info">
        <div className="navigation-tips">
          <button
            className={`nav-button nav-prev ${!canGoPrevious ? 'disabled' : ''}`}
            onClick={handlePreviousClick}
            disabled={!canGoPrevious}
          >
            ← Previous
          </button>
          <span className="page-counter">{pageNumber} / {totalPages}</span>
          <button
            className="nav-button nav-next"
            onClick={handleNextClick}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;