import React, { useState, useEffect, useRef } from "react";
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
  chatState,
  setChatState,
  isProfileOpen,
  handleProfileOpen,
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
  const [renamingThread, setRenamingThread] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef(null);

  // Initialize and persist expanded state
  useEffect(() => {
    console.log(window.location.href, 222);

    if(window.location.href.includes("/expanded")){
      localStorage.setItem("isExpanded", true);
    }else{
      localStorage.setItem("isExpanded", false);
    }

    const savedExpanded = localStorage.getItem("isExpanded") === "true";
    if (savedExpanded !== isExpanded) {
      onExpand(savedExpanded); // Sync with parent component
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);
  useEffect(() => {
    console.log(chatState, "header");
  }, [chatState]);
  const handleExpand = () => {
    // Get the current URL and construct the expanded URL
    const currentUrl = window.location.href;
    localStorage.setItem("isExpanded", !isExpanded);
    const baseUrl = currentUrl.split('/').slice(0, 3).join('/'); // Get protocol and domain
    const expandedUrl = `${baseUrl}/expanded`;
    
    // Redirect to the expanded URL
    window.location.href = expandedUrl;
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
    setRenamingThread(null);
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
      const thread = threads.find(
        (thread) => thread.threadid === threadToDelete,
      );
      await deleteThreadById(thread.id);
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

  const handleRenameClick = (threadId, currentTitle) => {
    setRenamingThread(threadId);
    setNewTitle(currentTitle);
    setThreadMenuOpen(null);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const saveRename = (threadId) => {
    if (
      newTitle.trim() &&
      newTitle.trim() !==
        threads.find((t) => t.threadid === threadId)?.threadTitle
    ) {
      updateThreadTitleById(threadId, newTitle.trim());
    }
    setRenamingThread(null);
  };

  const handleTitleBlur = (threadId) => {
    saveRename(threadId);
  };

  const handleKeyDown = (e, threadId) => {
    if (e.key === "Enter") {
      saveRename(threadId);
    } else if (e.key === "Escape") {
      setRenamingThread(null);
    }
  };

  useEffect(() => {
    if (renamingThread && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingThread]);
  const toggleProfileOpen = () => {
    setIsMenuOpen(false);
    handleProfileOpen();
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
          <img src="/images/Logo C.io.png" alt="logo" className="logo" />
        </div>
        <p className="title">Consultor Genesis</p>
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
          <button className="mobile-menu-button" onClick={toggleProfileOpen}>
            <User size={16} />
            <span>Perfil</span>
          </button>

          <button className="mobile-menu-button" onClick={openHistory}>
            <History size={16} />
            <span>Historia</span>
          </button>
          <button className="mobile-menu-button" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? "Modo Claro" : "Modo oscuro"}</span>
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
            historia <History size={20} />
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
                  {renamingThread === thread.threadid ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTitle}
                      onChange={handleTitleChange}
                      onBlur={() => handleTitleBlur(thread.threadid)}
                      onKeyDown={(e) => handleKeyDown(e, thread.threadid)}
                      className="rename-input"
                      maxLength={50}
                    />
                  ) : (
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
                  )}
                  {threadMenuOpen === thread.threadid && (
                    <ThreadMenuPopup
                      onRename={() =>
                        handleRenameClick(thread.threadid, thread.threadTitle)
                      }
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
