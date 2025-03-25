import React, { useState } from 'react';
import { FileInput, Send } from 'lucide-react';
import './index.css';

const Footer = ({ onSendMessage, isDarkMode ,isExpanded}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className={`footer-container ${isDarkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <form className='footer-form' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Escríbeme tu duda...'
          className={`footer-input ${isDarkMode ? 'dark-mode' : ''}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type='button' className={`footer-button ${isDarkMode ? 'dark-mode' : ''}`}>
          <FileInput size={20} />
        </button>
        <button type='submit' className={`footer-button ${isDarkMode ? 'dark-mode' : ''}`}>
          <Send size={20} />
        </button>
      </form>
      <div className={`powered-by ${isDarkMode ? 'dark-mode' : ''}`}>
        Powered by <strong>Nexau</strong>
      </div>
    </div>
  );
};

export default Footer;
