import React from 'react';
import { FileInput, Send } from 'lucide-react'; // Import icons
import './index.css'; // Import CSS for styling

const Footer = () => {
  return (
    <div className='footer-container'>
      <form className='footer-form'>
        {/* Text input field */}
        <input
          type='text'
          placeholder='Send a query...'
          className='footer-input'
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
        Powered by <strong>nexau.es</strong>
      </div>
    </div>
  );
};

export default Footer;