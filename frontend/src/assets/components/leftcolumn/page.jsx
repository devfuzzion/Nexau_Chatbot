import React, { useState, useRef, useEffect } from "react";
import { Plus, Sun, Moon, User, MoreVertical } from "lucide-react";
import ThreadMenuPopup from "../threadMenu/page.jsx";
import DeleteConfirmationPopup from "../deletePopup/page.jsx";
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
  isLoading = false,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deletingThread, setDeletingThread] = useState(false);
  const [localThreads, setLocalThreads] = useState(threads);

  // Track the last clicked thread to prevent duplicate events
  const lastClickedThread = useRef(null);

  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  const handleDeleteWithConfirmation = (threadId) => {
    setThreadToDelete(threadId);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;
    
    try {
      setDeletingThread(true);
      await deleteThreadById(threadToDelete);
      setLocalThreads(prev => prev.filter(t => t.threadid !== threadToDelete));
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

  const handleThreadClick = (threadId) => {
    if (lastClickedThread.current === threadId) return;
    
    lastClickedThread.current = threadId;
    changeThread(threadId, true); 
  };

  const handleCreateNewThread = () => {
    lastClickedThread.current = null;
    onCreateThread();
  };

  return (
    <div className={`left-column ${isDarkMode ? "dark" : ""}`}>
      <DeleteConfirmationPopup
        show={showDeletePopup}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        deleting={deletingThread}
      />

      <div className="new-chat-button" onClick={handleCreateNewThread}>
        <Plus size={20} />
        <span>Nuevo Chat</span>
      </div>

      <div className="history-section">
        <h4>Chats recientes</h4>
        {isLoading ? (
          <ul>
            {[...Array(5)].map((_, i) => (
              <SkeletonItem key={i} isDarkMode={isDarkMode} />
            ))}
          </ul>
        ) : localThreads.length > 0 ? (
          <ul>
            {localThreads.map((thread) => (
              <HistoryItem
                key={thread.threadid}
                thread={thread}
                changeThread={handleThreadClick}
                selectedThread={selectedThread}
                onRenameThread={updateThreadTitleById}
                onDeleteThread={handleDeleteWithConfirmation}
                isDarkMode={isDarkMode}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Iniciar una nueva conversación</p>
          </div>
        )}
      </div>

      <hr className="divider" />
      <div className="bottom-buttons">
        <button className="profile-button">
          <User size={20} />
          <span>Perfil</span>
        </button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? "Modo de luz" : "Modo oscuro"}</span>
        </button>
      </div>
    </div>
  );
};

const HistoryItem = React.memo(({
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

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRename = () => {
    setIsMenuOpen(false);
    setIsRenaming(true);
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
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setNewTitle(thread.threadTitle);
  }, [thread.threadTitle]);

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
          onRename={handleRename}
          onDelete={handleDelete}
          isDarkMode={isDarkMode}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </li>
  );
});

const SkeletonItem = React.memo(({ isDarkMode }) => {
  return (
    <li className={`skeleton-item ${isDarkMode ? "dark" : ""}`}>
      <div className="skeleton-content" />
    </li>
  );
});

export default LeftColumn;