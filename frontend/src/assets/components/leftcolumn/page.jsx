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
import ThreadMenuPopup from "../threadMenu/threadMenu.page.jsx";
import DeleteConfirmationPopup from "../deletePopup/deletePopup.page.jsx";
import ProfileOverlay from "../profile/page.jsx";
import "./index.css";

const LeftColumn = ({
  userData,
  setUserData,
  handleProfileOpen,
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
  const [showProfile, setShowProfile] = useState(false);

  const handleDeleteWithConfirmation = (id) => {
    setThreadToDelete(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      if (!threadToDelete) return;
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

      <ProfileOverlay
        userData={userData}
        setUserData={setUserData}
        isDarkMode={isDarkMode}
        isVisible={showProfile}
        onClose={() => setShowProfile(false)}
      />
      <DeleteConfirmationPopup
        show={showDeletePopup}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        deleting={deletingThread}
      />
      {/* New Chat Button */}
      <div className="new-chat-button" onClick={onCreateThread}>
        <Plus size={20} />
        <span>Nuevo Chat</span>
      </div>

      {/* Chat History Section */}
      <div className="history-section">
        <h4>Chats recientes</h4>
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
            <li className="no-chats">Aún no hay conversaciones</li>
          )}
        </ul>
      </div>

      {/* Bottom Buttons */}
      <hr className="divider" />
      <div className="bottom-buttons">
        <button className="profile-button" onClick={handleProfileOpen}>
          <User size={20} />
          <span>Perfil</span>
        </button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
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
  const inputRef = useRef(null);

  useEffect(() => {
    setNewTitle(thread.threadTitle);
  }, [thread.threadTitle]);
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDeleteThread(thread.id);
    setIsMenuOpen(false);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const saveRename = () => {
    if (newTitle.trim() && newTitle.trim() !== thread.threadTitle) {
      onRenameThread(thread.threadid, newTitle.trim());
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
        <ThreadMenuPopup
          onRename={handleRenameClick}
          onDelete={handleDelete}
          isDarkMode={isDarkMode}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </li>
  );
};

export default LeftColumn;
