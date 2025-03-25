import React, { useState, useEffect } from 'react';
import { 
  Expand, Minimize, ChevronDown, ChevronLeft, User, Menu, X, Sun, Moon, 
  MessageSquare, History 
} from 'lucide-react';
import './index.css';

const Header = ({ onExpand, isExpanded, onToggleVisibility }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize and persist expanded state
  useEffect(() => {
    const savedExpanded = localStorage.getItem('isExpanded') === 'true';
    if (savedExpanded !== isExpanded) {
      onExpand(savedExpanded); // Sync with parent component
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle('dark-mode', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    localStorage.setItem('isExpanded', newExpandedState.toString());
    onExpand(newExpandedState);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsHistoryOpen(false);
  };

  const openHistory = () => {
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  return (
    <div className={`header-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Left Section */}
      <div className='left-section'>
        <button className='hamburger-button' onClick={toggleMenu}>
          {isMenuOpen ? <X size={20} /> : <Menu size={25} />}
        </button>
        <div className='logo-container'>
          <img src='/images/image.jpg' alt='logo' className='logo' />
        </div>
        <p className='title'>Nexau</p>
      </div>

      {/* Right Section */}
      <div className='right-section'>
        <button className='expand-icon' onClick={handleExpand}>
          {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
        </button>
        <button className='chevron-down-button' onClick={onToggleVisibility}>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? '' : 'hidden'}`}>
        <div className='mobile-menu-header'>
          <h3 className='mobile-menu-title'>Menu</h3>
          <button className='back-button' onClick={toggleMenu}>
            <X size={20} />
          </button>
        </div>
        <div className='mobile-menu-content'>
          <button className='mobile-menu-button'>
            <MessageSquare size={16} />
            <span>Nuevo Chat</span>
          </button>
          <button className='mobile-menu-button'>
            <User size={16} />
            <span>Perfil</span>
          </button>
          <button className='mobile-menu-button' onClick={openHistory}>
            <History size={16} />
            <span>History</span>
          </button>
          <button className='mobile-menu-button' onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className={`history-menu ${isHistoryOpen ? 'open' : ''}`}>
        <div className='history-header'>
          <button className='back-button' onClick={closeHistory}>
            <ChevronLeft size={20} />
          </button>
          <h3 className='history-title'>History <History size={20} /></h3>
        </div>
        <div className='history-content'>
          <h4>Today</h4>
          <ul>
            <li>How to use the chatbot?</li>
            <li>What is React?</li>
          </ul>
          <h4>Yesterday</h4>
          <ul>
            <li>Explain CSS grid</li>
            <li>What is JavaScript?</li>
          </ul>
          <h4>Last 30 Days</h4>
          <ul>
            <li>Introduction to Python</li>
            <li>How to build a chatbot?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;