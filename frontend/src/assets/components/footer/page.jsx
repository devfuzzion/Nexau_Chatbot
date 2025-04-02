import React, { useState, useRef } from 'react';
import { FileInput, Send, FileCheck } from 'lucide-react';
import './index.css';

const Footer = ({ onSendMessage, isDarkMode, isExpanded }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message with file:', selectedFile?.name);
      await onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`footer-container ${isDarkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <form className='footer-form' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Escríbeme tu duda...'
          className={`footer-input ${isDarkMode ? 'dark-mode' : ''}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-input"
        />
        <button 
          type='button' 
          className={`footer-button ${isDarkMode ? 'dark-mode' : ''} ${selectedFile ? 'file-selected' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          title={selectedFile ? `Selected: ${selectedFile.name}` : 'Attach file'}
        >
          {selectedFile ? <FileCheck size={20} /> : <FileInput size={20} />}
        </button>
        <button type='submit' className={`footer-button ${isDarkMode ? 'dark-mode' : ''}`}>
          <Send size={20} />
        </button>
      </form>
      {selectedFile && (
        <div className={`selected-file ${isDarkMode ? 'dark-mode' : ''}`}>
          Selected: {selectedFile.name}
        </div>
      )}
      <div className={`powered-by ${isDarkMode ? 'dark-mode' : ''}`}>
        Powered by <strong>Nexau</strong>
      </div>
    </div>
  );
};

export default Footer;
