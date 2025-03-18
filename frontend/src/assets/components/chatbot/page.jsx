import React, { useState } from 'react';
import Header from '../header/page.jsx';
import Body from '../body/page.jsx';
import './index.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', isBot: true },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addClientMessage = (message) => {
    setMessages([...messages, { text: message, isBot: false }]);

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'This is a bot response to your message. Work in progress! ⚠️🚧', isBot: true },
      ]);
    }, 1000); 
  };

  const handleExpand = () => {
    console.log('Expanded:', !isExpanded);
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