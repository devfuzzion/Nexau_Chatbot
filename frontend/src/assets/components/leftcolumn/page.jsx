import React, { useState, useEffect } from 'react';
import { Plus, Sun, Moon, User } from 'lucide-react';
import './index.css';

const LeftColumn = () => {
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
    <div className='left-column'>
      <div className='new-chat-button'>
        <Plus size={20} />
        <span>New Chat</span>
      </div>

      <div className='history-section'>
        <h4>Today</h4>
        <ul>
          <li>How to use the chatbot?</li>
          <li>What is React?</li>
        </ul>

        <h4>Yesterday</h4>
        <ul>
          <li>Explain CSS grid</li>
          <li>What is JavaScript?</li>
        </ul>

        <h4>Last 30 Days</h4>
        <ul>
          <li>Introduction to Python</li>
          <li>How to build a chatbot?</li>
        </ul>
      </div>

      <hr className='divider' />

      <div className='bottom-buttons'>
        <button className='profile-button'>
          <User size={20} />
          <span>Profile</span>
        </button>
        <button className='theme-toggle-button' onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </div>
  );
};

export default LeftColumn;
