import React, { useState, useRef } from 'react';
import { FileInput, SendHorizonal, FileCheck } from 'lucide-react';
import './index.css';

const Footer = ({ onSendMessage, isDarkMode, isExpanded, isDisabled }) => {
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
    if (message.trim() && !isDisabled) {
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
          className={`footer-input ${isDarkMode ? 'dark-mode' : ''} ${isDisabled ? 'disabled' : ''}`}
          value={message}
          autoFocus={false}
          onChange={(e) => setMessage(e.target.value)}
          style={{ fontSize: '16px' }}
          inputMode="text"
          disabled={isDisabled}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-input"
          disabled={isDisabled}
        />
        <button
          type='button'
          className={`footer-button ${isDarkMode ? 'dark-mode' : ''} ${selectedFile ? 'file-selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          title={selectedFile ? `Selected: ${selectedFile.name}` : 'Attach file'}
          disabled={isDisabled}
        >
          {selectedFile ? <FileCheck size={20} /> : <FileInput size={20} />}
        </button>
        <button
          type='submit'
          className={`footer-button ${isDarkMode ? 'dark-mode' : ''} ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled || !message.trim()}
        >
          <SendHorizonal size={20} />
        </button>
      </form>
      {selectedFile && (
        <div className={`selected-file ${isDarkMode ? 'dark-mode' : ''}`}>
          Seleccionada: {selectedFile.name}
        </div>
      )}
      <div className={`powered-by ${isDarkMode ? 'dark-mode' : ''}`}>
        Powered by <strong onClick={() => window.open('https://nexau.es', '_blank')} style={{cursor: 'pointer'}}>Nexau</strong>
      </div>
    </div>
  );
};

export default Footer;