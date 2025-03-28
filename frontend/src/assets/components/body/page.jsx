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
  deleteThreadById,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

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
        setMessages([
          {
            text: "Failed to load messages. Please try again.",
            isBot: true,
          },
        ]);
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
          selectedThread={selectedThread}
          onCreateThread={createThread}
          deleteThreadById={deleteThreadById}
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
        <Footer
          onSendMessage={handleSendMessage}
          isDisabled={!selectedThread}
        />
      </div>
    </div>
  );
};

export default Body;
