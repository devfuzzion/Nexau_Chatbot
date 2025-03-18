import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Footer from '../footer/page.jsx';
import LeftColumn from '../leftcolumn/page.jsx';

const Body = ({ messages, onSendMessage, isExpanded }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [typingMessage, setTypingMessage] = useState(''); 
  const [isTyping, setIsTyping] = useState(false); 
  const [typingIndicator, setTypingIndicator] = useState(false); 

  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isBot) {
      setTypingIndicator(true);
      setTimeout(() => {
        setTypingIndicator(false);
        setIsTyping(true);

        let currentText = '';
        let index = 0;

        const typingInterval = setInterval(() => {
          if (index < lastMessage.text.length) {
            currentText += lastMessage.text[index];
            setTypingMessage(currentText);
            index++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);
          }
        }, 50); 
      }, 2000); 
    }
  }, [messages]);

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
              }${isExpanded ? 'expanded' : ''}`}
            >
              {msg.isBot && index === messages.length - 1 && typingIndicator ? (
                <div className="typing-indicator">
                  Thinking<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </div>
              ) : (
                msg.isBot && index === messages.length - 1 && isTyping
                  ? typingMessage
                  : msg.text
              )}
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <Footer onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default Body;