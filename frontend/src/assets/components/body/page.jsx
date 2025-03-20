import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Footer from "../footer/page.jsx";
import LeftColumn from "../leftcolumn/page.jsx";
import {
  fetchThreads,
  fetchMessages,
  sendMessage,
} from "../../../api/chatService.js";
import { useTheme } from "../../../hooks/useTheme.js";
import MessageList from "../messageList/messageList.page.jsx";
import TypingIndicator from "../typingIndicator/typingIndicator.page.jsx";

const Body = ({ isExpanded }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Thread state
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");

  // Message state
  const [messages, setMessages] = useState([]);
  const [typingState, setTypingState] = useState({
    isTyping: false,
    typingMessage: "",
    showIndicator: false,
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const messagesEndRef = useRef(null);

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

  // Function to create a new thread - moved from LeftColumn component
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

  // Load messages when selected thread changes
  useEffect(() => {
    if (!selectedThread) return;

    const loadMessages = async () => {
      try {
        const messageData = await fetchMessages(selectedThread);
        setMessages(messageData);
      } catch (error) {
        console.error("Failed to load messages:", error);
        // Could add UI error state here
      }
    };

    loadMessages();
  }, [selectedThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isWaitingForResponse]);

  // Handle bot typing animation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.isBot) return;

    // Start typing animation for bot messages
    setTypingState({
      showIndicator: false,
      isTyping: true,
      typingMessage: "",
    });

    let currentText = "";
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < lastMessage.text.length) {
        currentText += lastMessage.text[index];
        setTypingState((prev) => ({
          ...prev,
          typingMessage: currentText,
        }));
        index++;
      } else {
        clearInterval(typingInterval);
        setTypingState((prev) => ({ ...prev, isTyping: false }));
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [messages]);

  const handleSendMessage = async (message) => {
    // Add user message immediately
    setMessages((prev) => [...prev, { text: message, isBot: false }]);

    // Show thinking indicator immediately after sending message
    setIsWaitingForResponse(true);

    try {
      // Send to API and get response
      const botResponse = await sendMessage(selectedThread, message);

      // Hide thinking indicator
      setIsWaitingForResponse(false);

      // Add bot response
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error("Message sending failed:", error);

      // Hide thinking indicator
      setIsWaitingForResponse(false);

      // Show error message
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error sending your message. Please try again.",
          isBot: true,
        },
      ]);
    }
  };

  return (
    <div
      className={`body-wrapper ${isDarkMode ? "dark" : ""} ${
        isExpanded ? "expanded" : ""
      }`}
    >
      {isExpanded && (
        <LeftColumn
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          threads={threads}
          changeThread={setSelectedThread}
          activeThread={selectedThread}
          onCreateThread={createThread}
        />
      )}

      <div className={`main-content ${isDarkMode ? "dark" : ""}`}>
        <MessageList
          messages={messages}
          isDarkMode={isDarkMode}
          isExpanded={isExpanded}
          typingState={typingState}
          messagesEndRef={messagesEndRef}
          isWaitingForResponse={isWaitingForResponse}
        />
        <Footer onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Body;