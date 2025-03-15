import React, { useState } from 'react';
import { FileInput, Send } from 'lucide-react'; 
import './index.css'; 

const Footer = ({ onSendMessage }) => {
  const [message, setMessage] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (message.trim()) { 
      onSendMessage(message);
      setMessage(''); 
    }
  };

  return (
    <div className='footer-container'>
      <form className='footer-form' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Send a query...'
          className='footer-input'
          value={message}
          onChange={(e) => setMessage(e.target.value)} 
        />
        <button type='button' className='footer-button'>
          <FileInput size={20} />
        </button>
        <button type='submit' className='footer-button'>
          <Send size={20} />
        </button>
      </form>
      <div className='powered-by'>
        Powered by <strong>Devfuzzion.com</strong>
      </div>
    </div>
  );
};

export default Footer;