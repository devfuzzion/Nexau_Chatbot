import React from 'react';
import './index.css';

const Body = ({ messages }) => {
  return (
    <div className='body-container'>
      {/* Render all messages */}
      {messages.map((msg, index) => (
        <div
          key={index} // Use index as the key (ensure uniqueness)
          className={msg.isBot ? 'bot-message-container' : 'client-message-container'}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default Body;