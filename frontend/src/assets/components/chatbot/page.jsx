import React, { useState } from 'react';
import Header from '../header/page.jsx';
import Body from '../body/page.jsx';
import './index.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'This is a bot response. It can be a longer message to test scrolling.', isBot: true },
    { text: 'This is a client query. It can also be a longer message to test scrolling.', isBot: false },
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  const addClientMessage = (message) => {
    setMessages([...messages, { text: message, isBot: false }]);
  };

  const handleExpand = () => {
    console.log('Expanded:', !isExpanded); // Debugging
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`chatbot-container ${isExpanded ? 'expanded' : ''}`}>
      <Header onExpand={handleExpand} isExpanded={isExpanded} />
      <Body messages={messages} onSendMessage={addClientMessage} isExpanded={isExpanded} />
    </div>
  );
};

export default Chatbot;