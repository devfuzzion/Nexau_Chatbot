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
  MoreVertical,
} from "lucide-react";
import "./index.css";
import { useTheme } from "../../../hooks/useTheme.js";
import ThreadMenuPopup from "../threadMenu/threadMenu.page.jsx";
import DeleteConfirmationPopup from "../deletePopup/deletePopup.page.jsx";

const Header = ({
  onExpand,
  isExpanded,
  onToggleVisibility,
  threads,
  selectedThread,
  setSelectedThread,
  createThread,
  deleteThreadById,
  updateThreadTitleById,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deletingThread, setDeletingThread] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState(null);
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

    setThreadMenuOpen(null);
  };

  const handleCreateThread = () => {
    createThread();
    setIsMenuOpen(false);
  };

  const handleDeleteWithConfirmation = (threadId) => {
    setThreadToDelete(threadId);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThread(true);
      await deleteThreadById(threadToDelete);
    } finally {
      setDeletingThread(false);
      setShowDeletePopup(false);
      setThreadToDelete(null);
      setThreadMenuOpen(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setThreadToDelete(null);
  };

  const handleHistoryItemClick = (threadId) => {
    setSelectedThread(threadId);
    setIsHistoryOpen(false);
    setIsMenuOpen(false);
  };

  const toggleThreadMenu = (e, threadId) => {
    e.stopPropagation();
    setThreadMenuOpen(threadMenuOpen === threadId ? null : threadId);
  };

  const handleRename = (threadId, newTitle) => {
    updateThreadTitleById(threadId, newTitle);
    setThreadMenuOpen(null);
  };
  return (
    <div className={`header-container ${isExpanded ? "expanded" : ""}`}>
      <DeleteConfirmationPopup
        show={showDeletePopup}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        deleting={deletingThread}
      />
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
                  className={`history-item ${
                    selectedThread === thread.threadid ? "selected" : ""
                  }`}
                >
                  <div
                    className="history-item-content"
                    onClick={() => handleHistoryItemClick(thread.threadid)}
                  >
                    {thread.threadTitle}
                    <button
                      className="menu-button"
                      onClick={(e) => toggleThreadMenu(e, thread.threadid)}
                      aria-label="Thread options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  {threadMenuOpen === thread.threadid && (
                    <ThreadMenuPopup
                      onRename={() => {
                        const newTitle = prompt(
                          "Enter new title:",
                          thread.threadTitle,
                        );
                        if (newTitle) {
                          handleRename(thread.threadid, newTitle);
                        }
                      }}
                      onDelete={() =>
                        handleDeleteWithConfirmation(thread.threadid)
                      }
                      isDarkMode={isDarkMode}
                      onClose={() => setThreadMenuOpen(null)}
                    />
                  )}
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
