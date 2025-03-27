import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Footer from "../footer/page.jsx";
import LeftColumn from "../leftcolumn/page.jsx";
import { fetchMessages, sendMessage } from "../../../api/chatService.js";
import { useTheme } from "../../../hooks/useTheme.js";
import MessageList from "../messageList/messageList.page.jsx";

const Body = ({
  isExpanded,
  threads,
  selectedThread,
  setSelectedThread,
  createThread,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Thread state

  // Message state
  const [messages, setMessages] = useState([]);
  const [typingState, setTypingState] = useState({
    isTyping: false,
    typingMessage: "",
    showIndicator: false,
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const messagesEndRef = useRef(null);

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

    // Start the 2-second delay before showing the "Thinking..." animation
    const thinkingTimeout = setTimeout(() => {
      setIsWaitingForResponse(true); // Show "Thinking..." animation after 2 seconds
    }, 1000); // 2-second delay

    try {
      // Send to API and get response
      const botResponse = await sendMessage(selectedThread, message);

      // Clear the timeout and hide the "Thinking..." animation
      clearTimeout(thinkingTimeout);
      setIsWaitingForResponse(false);

      // Add bot response
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error("Message sending failed:", error);

      // Clear the timeout and hide the "Thinking..." animation
      clearTimeout(thinkingTimeout);
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
