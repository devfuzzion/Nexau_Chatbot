import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import "./index.css";
import {
  fetchThreads,
  deleteThread,
  updateThreadTitle,
  getUserData,
  createThread,
} from "../../../api/chatService.js";

const ExpandedChatbot = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Always expanded in this view
  const [isVisible, setIsVisible] = useState(true);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [chatState, setChatState] = useState("maximized");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is required.");
      }
      const userData = await getUserData(userId);
      setUserData(userData);
      console.log("userData", userData);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  useEffect(() => {
    const pathname = window.location.pathname; // e.g. "/expanded/user_1234567890"
    console.log("pathname", pathname);
    const pathParts = pathname.split("/");
    const user_id = pathParts[pathParts.length - 1];
    setUserId(user_id);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Function to create a new thread
  const handleCreateThread = async () => {
    try {
      const response = await fetch(
        "https://nexau.devfuzzion.com/api/create-thread",
        // "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/create-thread",
        // "http://localhost:3000/create-thread",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threadTitle: "Nuevo Chat", userId: localStorage.getItem('userId') || "guest" }),
        },
      );

      const data = await response.json();

      if (data.success) {
        const threadsData = await fetchThreads(userId);
        setThreads(threadsData);

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
    const baseUrl = currentUrl.split("/").slice(0, 3).join("/");
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
        createThread={handleCreateThread}
        deleteThreadById={deleteThreadById}
        updateThreadTitleById={updateThreadTitleById}
      />
      <Body
        isProfileOpen={isProfileOpen}
        handleProfileOpen={handleProfileOpen}
        isExpanded={isExpanded}
        userData={userData}
        threads={threads}
        setThreads={setThreads}
        selectedThread={selectedThread}
        setSelectedThread={setSelectedThread}
        createThread={handleCreateThread}
        deleteThreadById={deleteThreadById}
        updateThreadTitleById={updateThreadTitleById}
      />
    </div>
  );
};

export default ExpandedChatbot;
