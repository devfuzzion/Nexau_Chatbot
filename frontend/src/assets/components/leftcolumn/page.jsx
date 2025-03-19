import React, { useState, useEffect } from "react";
import { Plus, Sun, Moon, User } from "lucide-react";
import "./index.css";

const LeftColumn = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle("dark-mode", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // Fetch threads from backend
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("http://localhost:3000/threads");
        const data = await response.json();
        console.log(data);
        if (data.success) {
          setThreads(data.threads);
        } else {
          console.error("Failed to fetch threads");
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, []);

  // Function to create a new thread
  const createThread = async () => {
    try {
      const response = await fetch("http://localhost:3000/create-thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ threadTitle: "New Chat" }),
      });

      const data = await response.json();

      if (data.success) {
        // Create a new thread object based on the response format
        const newThread = {
          id: threads.length + 1, // Temporary ID for React key
          threadid: data.thread.id,
          createdat: new Date().toISOString(),
          threadTitle: "New Chat",
        };

        // Update threads state with new thread
        setThreads((prevThreads) => [newThread, ...prevThreads]);
      } else {
        console.error("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  return (
    <div className="left-column">
      <div className="new-chat-button" onClick={createThread}>
        <Plus size={20} />
        <span>New Chat</span>
      </div>

      <div className="history-section">
        <h4>Recent Chats</h4>
        <ul>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <li key={thread.threadid}>{thread.threadTitle}</li>
            ))
          ) : (
            <li>No chats available</li>
          )}
        </ul>
      </div>

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

export default LeftColumn;
