import React, { useState, useEffect } from 'react';
import './index.css';
import Footer from '../footer/page.jsx';
import LeftColumn from '../leftcolumn/page.jsx';

const Body = ({ messages, onSendMessage, isExpanded }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle('dark-mode', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <div className={`body-wrapper ${isDarkMode ? 'dark' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {isExpanded && <LeftColumn isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      <div className={`main-content ${isDarkMode ? 'dark' : ''}`}>
        <div className={`messages-container ${isExpanded ? 'expanded' : ''}`}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-container ${msg.isBot ? 'bot-message-container' : 'client-message-container'} ${
                isDarkMode ? 'dark' : ''
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <Footer onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default Body;
