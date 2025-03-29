import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Sun,
  Moon,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Theater,
} from "lucide-react";
import "./index.css";

const LeftColumn = ({
  threads,
  changeThread,
  isDarkMode,
  toggleTheme,
  onCreateThread,
  selectedThread,
  deleteThreadById,
  updateThreadTitleById,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deletingThread, setDeletingThread] = useState(false);

  const handleDeleteWithConfirmation = (id) => {
    setThreadToDelete(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      setDeletingThread(true);
      await deleteThreadById(threadToDelete);
    } finally {
      setDeletingThread(false);
      setShowDeletePopup(false);
      setThreadToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setThreadToDelete(null);
  };

  return (
    <div className={`left-column ${isDarkMode ? "dark" : ""}`}>
      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="delete-confirmation-popup">
            <div className="popup-header">
              <h3>Delete Conversation</h3>
              <button
                onClick={cancelDelete}
                className="close-button"
                disabled={deletingThread}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="popup-buttons">
              <button
                onClick={cancelDelete}
                className="cancel-button"
                disabled={deletingThread}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="confirm-button"
                disabled={deletingThread}
              >
                {deletingThread ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Button */}
      <div className="new-chat-button" onClick={onCreateThread}>
        <Plus size={20} />
        <span>New Chat</span>
      </div>

      {/* Chat History Section */}
      <div className="history-section">
        <h4>Recent Chats</h4>
        <ul>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <HistoryItem
                key={thread.threadid}
                thread={thread}
                changeThread={changeThread}
                selectedThread={selectedThread}
                onRenameThread={updateThreadTitleById}
                onDeleteThread={handleDeleteWithConfirmation}
                isDarkMode={isDarkMode}
              />
            ))
          ) : (
            <li className="no-chats">No conversations yet</li>
          )}
        </ul>
      </div>

      {/* Bottom Buttons */}
      <hr className="divider" />
      <div className="bottom-buttons">
        <button className="profile-button">
          <User size={20} />
          <span>Profile</span>
        </button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );
};

const HistoryItem = ({
  thread,
  changeThread,
  selectedThread,
  onRenameThread,
  onDeleteThread,
  isDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(thread.threadTitle);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setIsMenuOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteThread(thread.id);
    setIsMenuOpen(false);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const saveRename = () => {
    if (newTitle.trim() && newTitle.trim() !== thread.threadTitle) {
      onRenameThread(thread.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleTitleBlur = () => {
    saveRename();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      setNewTitle(thread.threadTitle);
      setIsRenaming(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);
  return (
    <li
      onClick={() => changeThread(thread.threadid)}
      className={`history-item ${
        selectedThread === thread.threadid ? "selected-item" : ""
      }`}
    >
      <div className="history-item-content">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="rename-input"
            maxLength={50}
          />
        ) : (
          <>
            <span className="thread-title">{thread.threadTitle}</span>
            <button
              className="menu-button"
              onClick={toggleMenu}
              aria-label="Chat options"
            >
              <MoreVertical size={16} />
            </button>
          </>
        )}
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className={`thread-menu-popup ${isDarkMode ? "dark" : ""}`}
        >
          <button onClick={handleRenameClick} className="menu-item">
            <Pencil size={16} />
            <span>Rename</span>
          </button>
          <button onClick={handleDelete} className="menu-item">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </li>
  );
};

export default LeftColumn;
