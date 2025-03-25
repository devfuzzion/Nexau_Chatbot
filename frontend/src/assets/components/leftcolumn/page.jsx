import React from "react";
import { Plus, Sun, Moon, User } from "lucide-react";
import "./index.css";

const LeftColumn = ({
  threads,
  changeThread,
  isDarkMode,
  toggleTheme,
  onCreateThread,
}) => {
  return (
    <div className="left-column">
      <div className="new-chat-button" onClick={onCreateThread}>
        <Plus size={20} />
        <span>Nuevo Chat</span>
      </div>

      <div className="history-section">
        <h4>Chats Recientes</h4>
        <ul>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <li
                key={thread.threadid}
                onClick={() => changeThread(thread.threadid)}
              >
                {thread.threadTitle}
              </li>
            ))
          ) : (
            <li>No hay chats disponibles</li>
          )}
        </ul>
      </div>

      <hr className="divider" />

      <div className="bottom-buttons">
        <button className="profile-button">
          <User size={20} />
          <span>Perfil</span>
        </button>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );
};

export default LeftColumn;
