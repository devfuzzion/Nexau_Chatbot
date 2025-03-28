import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Footer from "../footer/page.jsx";
import LeftColumn from "../leftcolumn/page.jsx";
import { fetchMessages, sendMessage } from "../../../api/chatService.js";
import { useTheme } from "../../../hooks/useTheme.js";
import MessageList from "../messageList/messageList.page.jsx";

const Body = ({
  isExpanded,
  threads: initialThreads,
  selectedThread: initialSelectedThread,
  setSelectedThread: parentSetSelectedThread,
  createThread: parentCreateThread,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Local state for threads and selected thread
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThread, setSelectedThread] = useState(initialSelectedThread);

  // Message state
  const [messages, setMessages] = useState([]);
  const [typingState, setTypingState] = useState({
    isTyping: false,
    typingMessage: "",
    showIndicator: false,
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync with parent component's state
  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  useEffect(() => {
    setSelectedThread(initialSelectedThread);
  }, [initialSelectedThread]);

  // Load messages when selected thread changes
  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messageData = await fetchMessages(selectedThread);
        setMessages(messageData);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([{
          text: "Failed to load messages. Please try again.",
          isBot: true
        }]);
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
    if (!selectedThread) return;

    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    setIsWaitingForResponse(true);

    try {
      const botResponse = await sendMessage(selectedThread, message);
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error("Message sending failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error sending your message. Please try again.",
          isBot: true,
        },
      ]);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  // Thread management functions
  const handleCreateThread = async () => {
    const newThread = await parentCreateThread();
    setThreads(prev => [...prev, newThread]);
    setSelectedThread(newThread.threadid);
  };

  const handleRenameThread = (threadId, newTitle) => {
    setThreads(prev => 
      prev.map(thread => 
        thread.threadid === threadId 
          ? { ...thread, threadTitle: newTitle } 
          : thread
      )
    );
  };

  const handleDeleteThread = (threadId) => {
    setThreads(prev => prev.filter(thread => thread.threadid !== threadId));
    
    if (selectedThread === threadId) {
      setSelectedThread(null);
      parentSetSelectedThread(null);
    }
  };

  const handleChangeThread = (threadId) => {
    setSelectedThread(threadId);
    parentSetSelectedThread(threadId);
  };

  return (
    <div className={`body-wrapper ${isDarkMode ? "dark" : ""} ${isExpanded ? "expanded" : ""}`}>
      {isExpanded && (
        <LeftColumn
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          threads={threads}
          changeThread={handleChangeThread}
          selectedThread={selectedThread}
          onCreateThread={handleCreateThread}
          onRenameThread={handleRenameThread}
          onDeleteThread={handleDeleteThread}
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
        <Footer onSendMessage={handleSendMessage} isDisabled={!selectedThread} />
      </div>
    </div>
  );
};

export default Body;