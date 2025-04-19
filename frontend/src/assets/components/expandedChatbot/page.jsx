import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import "./index.css";
import {
  fetchThreads,
  deleteThread,
  updateThreadTitle,
} from "../../../api/chatService.js";

const ExpandedChatbot = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Always expanded in this view
  const [isVisible, setIsVisible] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [chatState, setChatState] = useState("maximized");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const cookieName = "hubspotutk";
    const cookies = document.cookie.split("; ");
    const userIdCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
    const userId = userIdCookie ? userIdCookie.split("=")[1] : null;
    setUserId(userId);
  }, []);

  // Function to create a new thread
  const createThread = async () => {
    try {
      const response = await fetch(
        // "http://localhost:3000/create-thread",
        "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/create-thread",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threadTitle: "Nuevo Chat", userId: userId || "guest" }),
        },
      );

      const data = await response.json();

      if (data.success) {
        const threadsData = await fetchThreads(userId);
        setThreads(threadsData);
        if (data.thread && data.thread.id) {
          setSelectedThread(data.thread.id);
        }
      }
    } catch (error) {
      console.error("Error creating thread:", error);
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

  // Fetch threads on component mount
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
      }
    };

    loadThreads();
  }, [userId]);

  const handleProfileOpen = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleMinimize = () => {
    // Get the current URL and construct the minimized URL
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('/').slice(0, 3).join('/');
    const minimizedUrl = baseUrl;
    
    // Redirect to the minimized URL
    window.location.href = minimizedUrl;
  };

  return (
    <div className="expanded-chatbot-container">
      <Header
        chatState={chatState}
        setChatState={setChatState}
        isProfileOpen={isProfileOpen}
        handleProfileOpen={handleProfileOpen}
        onExpand={handleMinimize}
        isExpanded={isExpanded}
        onToggleVisibility={() => {}}
        threads={threads}
        selectedThread={selectedThread}
        setSelectedThread={setSelectedThread}
        createThread={createThread}
        deleteThreadById={deleteThreadById}
        updateThreadTitleById={updateThreadTitleById}
      />
      <Body
        isProfileOpen={isProfileOpen}
        handleProfileOpen={handleProfileOpen}
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
  );
};

export default ExpandedChatbot; 