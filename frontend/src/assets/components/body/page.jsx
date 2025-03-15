import React from 'react';
import './index.css';
import Footer from '../footer/page.jsx';
import { Plus, Sun, Moon, User } from 'lucide-react';

const Body = ({ messages, onSendMessage, isExpanded }) => {
  // Dummy history data
  const history = {
    today: ['How to use the chatbot?', 'What is React?'],
    yesterday: ['Explain CSS grid', 'What is JavaScript?'],
    last30Days: ['Introduction to Python', 'How to build a chatbot?'],
  };

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className='body-wrapper'>
      {isExpanded && (
        <div className='left-column'>
          <div className='new-chat-button'>
            <Plus size={20} />
            <span>New Chat</span>
          </div>
          <div className='history-section'>
            <h4>Today</h4>
            <ul>
              {history.today.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h4>Yesterday</h4>
            <ul>
              {history.yesterday.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h4>Last 30 Days</h4>
            <ul>
              {history.last30Days.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
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
      )}
      <div className='main-content'>
        <div className='messages-container'>
          {messages.map((msg, index) => (
            <div
              key={index} 
              className={msg.isBot ? 'bot-message-container' : 'client-message-container'}
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