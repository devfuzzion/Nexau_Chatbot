import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import { Infinity } from "lucide-react";
import "./index.css";
import Swal from 'sweetalert2';
import { showLoading, showError } from "../../../utils/sweetalertHelper.js";
import {
  fetchThreads,
  deleteThread,
  updateThreadTitle,
  createThread,
} from "../../../api/chatService.js";
const Chatbot = ({ userData, setUserData }) => {
  // Initialize states from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem("isExpanded") === "true";
  });

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("isVisible") !== "false"; // Default to true if not set
  });

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");

  const [chatState, setChatState] = useState("minimized");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("isDarkMode") === "true";
  });
  const [userId, setUserId] = useState(
    localStorage.getItem("userId") || "guest",
  );

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const threadsData = await fetchThreads(userId);
        console.log("threadsData", threadsData);
        if (threadsData.length > 0) {
          setThreads(threadsData);
          setSelectedThread(threadsData[0].threadid);
        }
      } catch (error) {
        console.error("Failed to load threads:", error);
        // Could add UI error state here
      }
    };
    loadThreads();
  }, [userId]);

  // Function to create a new thread - moved from LeftColumn component
  const handleCreateThread = async () => {
    try {
      // Show the loading animation
      showLoading('Creando nuevo chat...', 'Por favor espere mientras se crea su nuevo chat', isDarkMode);

      const response = await fetch(
        "https://nexau.devfuzzion.com/api/create-thread",
        // "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/create-thread",
        // "http://localhost:3000/create-thread",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadTitle: "Nuevo Chat",
            userId: localStorage.getItem('userId') || "guest",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        const threadsData = await fetchThreads(userId);
        setThreads(threadsData);

        if (data.thread && data.thread.id) {
          setSelectedThread(data.thread.id);
        }
        
        // Close the loading animation
        Swal.close();
      } else {
        console.error("Failed to create thread");
        // Show error message
        showError('Error', 'No se pudo crear el chat, por favor intente de nuevo', isDarkMode);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      // Show error message
      showError('Error', 'No se pudo crear el chat, por favor intente de nuevo', isDarkMode);
    }
  };
  const deleteThreadById = async (id) => {
    try {
      const response = await deleteThread(id);
      if (response.success) {
        const threadsData = await fetchThreads(userId);
        setThreads(threadsData);
        if (threadsData.length > 0) {
          setSelectedThread(threadsData[0].threadid);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateThreadTitleById = async (id, title, aiTitle) => {
    try {
      const response = await updateThreadTitle(id, title, aiTitle);
      if (response.success) {
        const updatedThreads = threads.map((thread) =>
          thread.threadid === id
            ? { ...thread, threadTitle: response.title }
            : thread,
        );
        setThreads(updatedThreads);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  // Persist states to localStorage when they change
  useEffect(() => {
    localStorage.setItem("isExpanded", isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem("isVisible", isVisible);
  }, [isVisible]);

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
  };

  const toggleVisibility = () => {
    console.log("toggleVisibility", isExpanded, isVisible, chatState);
    setIsVisible((prev) => !prev);
    if (localStorage.getItem("isExpanded") === "true" && isVisible === true) {
      setChatState("minimized");
    } else if (localStorage.getItem("isExpanded") === "true") {
      setChatState("maximized");
    } else {
      setChatState(isVisible ? "minimized" : "open");
    }
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (chatState === "minimized") {
        window.parent.postMessage(
          { type: "resize-iframe", width: 60, height: 60 },
          "*",
        );
      } else if (chatState === "open") {
        window.parent.postMessage(
          { type: "resize-iframe", width: 400, height: 500 },
          "*",
        );
      } else if (chatState === "maximized") {
        window.parent.postMessage(
          {
            type: "resize-iframe",
            width: window.innerWidth,
            height: window.innerHeight,
          },
          "*",
        );
      }
    }
  }, [chatState]);

  const handleProfileOpen = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const toggleTheme = (darkMode) => {
    setIsDarkMode(darkMode);
    localStorage.setItem("isDarkMode", darkMode);
    // Update body class for global theme
    document.body.classList.toggle("dark-mode", darkMode);
  };

  // Apply theme on mount
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, []);

  return (
    <>
      {/* Infinity Button (visible only when chatbot is hidden) */}
      {!isVisible && (
        <button
          className={`infinity-button ${isDarkMode ? "dark" : ""}`}
          onClick={toggleVisibility}
        >
          <img src="/images/chat_icon.png" alt="logo" className="chat-logo" />
        </button>
      )}

      {/* Chatbot Container */}
      <div
        className={`chatbot-container ${isExpanded ? "expanded" : ""} ${
          isVisible ? "" : "hidden"
        } ${isDarkMode ? "dark" : ""}`}
      >
        <Header
          chatState={chatState}
          setChatState={setChatState}
          isProfileOpen={isProfileOpen}
          handleProfileOpen={handleProfileOpen}
          onExpand={handleExpand}
          isExpanded={isExpanded}
          onToggleVisibility={toggleVisibility}
          threads={threads}
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          createThread={handleCreateThread}
          deleteThreadById={deleteThreadById}
          updateThreadTitleById={updateThreadTitleById}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <Body
          userData={userData}
          setUserData={setUserData}
          isProfileOpen={isProfileOpen}
          handleProfileOpen={handleProfileOpen}
          isExpanded={isExpanded}
          threads={threads}
          setThreads={setThreads}
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          createThread={handleCreateThread}
          deleteThreadById={deleteThreadById}
          updateThreadTitleById={updateThreadTitleById}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </div>
    </>
  );
};

export default Chatbot;
