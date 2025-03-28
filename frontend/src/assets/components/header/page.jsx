import React, { useState, useEffect } from "react";
import {
  Expand,
  Minimize,
  ChevronDown,
  ChevronLeft,
  User,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquare,
  History,
} from "lucide-react";
import "./index.css";
import { useTheme } from "../../../hooks/useTheme.js";

const Header = ({
  onExpand,
  isExpanded,
  onToggleVisibility,
  threads,
  selectedThread,
  setSelectedThread,
  createThread,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize and persist expanded state
  useEffect(() => {
    const savedExpanded = localStorage.getItem("isExpanded") === "true";
    if (savedExpanded !== isExpanded) {
      onExpand(savedExpanded); // Sync with parent component
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    localStorage.setItem("isExpanded", newExpandedState.toString());
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

  const handleCreateThread = () => {
    createThread();
    setIsMenuOpen(false); 
  };

  const handleHistoryItemClick = (threadId) => {
    setSelectedThread(threadId); 
    setIsHistoryOpen(false); 
    setIsMenuOpen(false); 
  };

  return (
    <div className={`header-container ${isExpanded ? "expanded" : ""}`}>
      {/* Left Section */}
      <div className="left-section">
        <button className="hamburger-button" onClick={toggleMenu}>
          {isMenuOpen ? <X size={20} /> : <Menu size={25} />}
        </button>
        <div className="logo-container">
          <img src="/images/image.jpg" alt="logo" className="logo" />
        </div>
        <p className="title">Nexau</p>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <button className="expand-icon" onClick={handleExpand}>
          {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
        </button>
        <button className="chevron-down-button" onClick={onToggleVisibility}>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "" : "hidden"}`}>
        <div className="mobile-menu-header">
          <h3 className="mobile-menu-title">Menu</h3>
          <button className="back-button" onClick={toggleMenu}>
            <X size={20} />
          </button>
        </div>
        <div className="mobile-menu-content">
          <button className="mobile-menu-button" onClick={handleCreateThread}>
            <MessageSquare size={16} />
            <span>Nuevo Chat</span>
          </button>
          <button className="mobile-menu-button">
            <User size={16} />
            <span>Perfil</span>
          </button>
          <button className="mobile-menu-button" onClick={openHistory}>
            <History size={16} />
            <span>History</span>
          </button>
          <button className="mobile-menu-button" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? "Modo de luz" : "Modo oscuro"}</span>
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className={`history-menu ${isHistoryOpen ? "open" : ""}`}>
        <div className="history-header">
          <button className="back-button" onClick={closeHistory}>
            <ChevronLeft size={20} />
          </button>
          <h3 className="history-title">
            History <History size={20} />
          </h3>
        </div>
        <div className="history-content">
          <ul>
            {threads.length > 0 ? (
              threads.map((thread) => (
                <li
                  key={thread.threadid}
                  onClick={() => handleHistoryItemClick(thread.threadid)}
                >
                  {thread.threadTitle}
                </li>
              ))
            ) : (
              <li>No hay chats disponibles</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
