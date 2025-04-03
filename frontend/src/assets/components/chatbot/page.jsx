import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import { Infinity } from "lucide-react";
import "./index.css";
import {
  fetchThreads,
  deleteThread,
  updateThreadTitle,
} from "../../../api/chatService.js";
const Chatbot = () => {
  // Initialize states from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem("isExpanded") === "true";
  });

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("isVisible") !== "false"; // Default to true if not set
  });

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  // Function to create a new thread - moved from LeftColumn component
  const createThread = async () => {
    try {
      const response = await fetch(
        "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/create-thread",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threadTitle: "Nuevo Chat" }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Refresh threads after creating a new one
        const threadsData = await fetchThreads();
        setThreads(threadsData);

        // Select the newly created thread
        if (data.thread && data.thread.id) {
          setSelectedThread(data.thread.id);
        }
      } else {
        console.error("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };
  const deleteThreadById = async (id) => {
    try {
      const response = await deleteThread(id);
      if (response.success) {
        const threadsData = await fetchThreads();
        setThreads(threadsData);
        console.log(2);
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
  // Fetch threads on component mount
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const threadsData = await fetchThreads();
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
  }, []);
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
    setIsVisible((prev) => !prev);
  };

  return (
    <>
      {/* Infinity Button (visible only when chatbot is hidden) */}
      {!isVisible && (
        <button className="infinity-button" onClick={toggleVisibility}>
          <Infinity size={30} />
        </button>
      )}

      {/* Chatbot Container */}
      <div
        className={`chatbot-container ${isExpanded ? "expanded" : ""} ${
          isVisible ? "" : "hidden"
        }`}
      >
        <Header
          onExpand={handleExpand}
          isExpanded={isExpanded}
          onToggleVisibility={toggleVisibility}
          threads={threads}
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          createThread={createThread}
        />
        <Body
          isExpanded={isExpanded}
          threads={threads}
          setThreads={setThreads}
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          createThread={createThread}
          deleteThreadById={deleteThreadById}
          updateThreadTitleById={updateThreadTitleById}
        />
      </div>
    </>
  );
};

export default Chatbot;
