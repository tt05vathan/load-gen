import React from 'react';
import './WelcomePage.css';

const WelcomePage = ({ onStart }) => {
  return (
    <div className="welcome-page">
      <div className="hearts-background">
        <div className="heart heart1">💖</div>
        <div className="heart heart2">💕</div>
        <div className="heart heart3">💗</div>
        <div className="heart heart4">💝</div>
        <div className="heart heart5">💘</div>
        <div className="heart heart6">💞</div>
      </div>
      
      <div className="welcome-content">
        <h1 className="birthday-title">
          🎂 Happy Birthday My Love! 🎂
        </h1>
        
        <div className="birthday-message">
          <p>Today is your special day, and I want to make it magical! ✨</p>
          <p>I've prepared something special just for you...</p>
          <p>A collection of messages and memories that show how much you mean to me 💕</p>
        </div>
        
        <button className="start-button" onClick={onStart}>
          <span>Start Your Journey 💖</span>
        </button>
        
        <div className="instruction">
          <p>Use ← → arrow keys to navigate through the pages</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;