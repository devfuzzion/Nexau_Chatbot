import React, { useState } from 'react';
import Header from '../header/page.jsx';
import Body from '../body/page.jsx';
import Footer from '../footer/page.jsx';
import './index.css'; 

const Chatbot = () => {
  // State to manage all messages (both bot and client)
  const [messages, setMessages] = useState([
    { text: 'This is a bot response. It can be a longer message to test scrolling.', isBot: true },
    { text: 'This is a client query. It can also be a longer message to test scrolling.', isBot: false },
  ]);

  // Function to add a new client message
  const addClientMessage = (message) => {
    setMessages([...messages, { text: message, isBot: false }]);
  };

  return (
    <div className='chatbot-container'>
      <Header />
      <Body messages={messages} />
      <Footer onSendMessage={addClientMessage} />
    </div>
  );
};

export default Chatbot;