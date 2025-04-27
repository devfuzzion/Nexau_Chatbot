import React, { useState, useRef, useEffect } from 'react';
import { FileInput, SendHorizonal, FileCheck, X } from 'lucide-react';
import './index.css';

const Footer = ({ onSendMessage, isDarkMode, isExpanded, isDisabled }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [lineCount, setLineCount] = useState(1);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Update line count whenever message changes
  useEffect(() => {
    const newLineCount = (message.match(/\n/g) || []).length + 1;
    setLineCount(newLineCount > 5 ? 5 : newLineCount);
  }, [message]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const newMessage = message.substring(0, cursorPosition) + '\n' + message.substring(cursorPosition);
      setMessage(newMessage);
      
      // Set cursor position after the new line on next render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPosition + 1;
          textareaRef.current.selectionEnd = cursorPosition + 1;
        }
      }, 0);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      console.log('Sending message with file:', selectedFile?.name);
      const messageText = selectedFile 
        ? `document:${selectedFile.name}\nUser message: ${message}`
        : message;
      await onSendMessage(messageText, selectedFile);
      setMessage('');
      setSelectedFile(null);
      setLineCount(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`footer-container ${isDarkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {selectedFile && (
        <div className='file-preview-container'>
          <div className={`file-preview ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="file-info">
              <FileCheck size={16} />
              <span className="file-name">{selectedFile.name}</span>
              <button
                className="remove-file-btn"
                onClick={handleRemoveFile}
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <form className='footer-form' onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          placeholder='Escríbeme tu duda...'
          className={`footer-input ${isDarkMode ? 'dark-mode' : ''} ${isDisabled ? 'disabled' : ''} ${lineCount > 1 ? 'multiline' : ''}`}
          value={message}
          autoFocus={false}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ 
            fontSize: '16px',
            height: `${Math.min(lineCount * 18 + 6, 96)}px`,
            overflowY: lineCount >= 5 ? 'auto' : 'hidden'
          }}
          rows={1}
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
          title="Attach file"
          disabled={isDisabled}
        >
          <FileInput size={20} />
        </button>
        <button
          type='submit'
          className={`footer-button ${isDarkMode ? 'dark-mode' : ''} ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled || !message.trim()}
        >
          <SendHorizonal size={20} />
        </button>
      </form>
      <div className={`powered-by ${isDarkMode ? 'dark-mode' : ''}`}>
        Powered by <strong onClick={() => window.open('https://nexau.es', '_blank')} style={{ cursor: 'pointer' }}>Nexau</strong>
      </div>
    </div>
  );
};

export default Footer;