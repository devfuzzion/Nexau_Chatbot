import React, { useState } from 'react';
import { FileInput, Send } from 'lucide-react'; // Import icons
import './index.css'; // Import CSS for styling

const Footer = ({ onSendMessage }) => {
  const [message, setMessage] = useState(''); // State to manage the input field

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (message.trim()) { // Check if the message is not empty
      onSendMessage(message); // Pass the message to the parent component
      setMessage(''); // Clear the input field
    }
  };

  return (
    <div className='footer-container'>
      <form className='footer-form' onSubmit={handleSubmit}>
        {/* Text input field */}
        <input
          type='text'
          placeholder='Send a query...'
          className='footer-input'
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Update state on change
        />
        {/* Attach document button */}
        <button type='button' className='footer-button'>
          <FileInput size={20} /> {/* Attach document icon */}
        </button>
        {/* Send message button */}
        <button type='submit' className='footer-button'>
          <Send size={20} /> {/* Send message icon */}
        </button>
      </form>
      <div className='powered-by'>
        Powered by <strong>Devfuzzion.com</strong>
      </div>
    </div>
  );
};

export default Footer;