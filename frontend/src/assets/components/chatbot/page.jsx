import React, { useState } from 'react';
import Header from '../header/page.jsx';
import Body from '../body/page.jsx';
import { Infinity } from 'lucide-react'; // Import the Infinity icon
import './index.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', isBot: true },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

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

  const toggleVisibility = () => {
    setIsVisible(!isVisible); // Toggle visibility
  };

  return (
    <>
      {/* Infinity Button (visible only when chatbot is hidden) */}
      {!isVisible && (
        <button className='infinity-button' onClick={toggleVisibility}>
          <Infinity size={30} />
        </button>
      )}

      {/* Chatbot Container */}
      <div className={`chatbot-container ${isExpanded ? 'expanded' : ''} ${isVisible ? '' : 'hidden'}`}>
        <Header onExpand={handleExpand} isExpanded={isExpanded} onToggleVisibility={toggleVisibility} />
        <Body messages={messages} onSendMessage={addClientMessage} isExpanded={isExpanded} />
      </div>
    </>
  );
};

export default Chatbot;