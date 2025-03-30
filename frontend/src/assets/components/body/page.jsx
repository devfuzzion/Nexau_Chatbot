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
  updateThreadTitleById,
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
  const typingIntervalRef = useRef(null);
  const thinkingTimeoutRef = useRef(null);
  // Load messages when selected thread changes

  useEffect(() => {
    return () => {
      clearInterval(typingIntervalRef.current);
      clearTimeout(thinkingTimeoutRef.current);
    };
  }, []);

  const handleThreadChange = (threadId) => {
    clearInterval(typingIntervalRef.current);
    clearTimeout(thinkingTimeoutRef.current);
    setSelectedThread(threadId);
    setTypingState({
      isTyping: false,
      typingMessage: "",
      showIndicator: false,
    });
  };

  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messageData = await fetchMessages(selectedThread);
        setMessages(messageData.map((msg) => ({ ...msg, isNew: false })));
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([
          {
            text: "Failed to load messages. Please try again.",
            isBot: true,
            isNew: false,
          },
        ]);
      }
    };

    loadMessages();
  }, [selectedThread]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaitingForResponse]);

  // Typing animation
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.isNew || !lastMessage?.isBot) return;

    setTypingState((prev) => ({
      ...prev,
      isTyping: true,
      typingMessage: "",
    }));

    let currentText = "";
    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      if (index < lastMessage.text.length) {
        currentText += lastMessage.text[index];
        setTypingState((prev) => ({
          ...prev,
          typingMessage: currentText,
        }));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        setTypingState((prev) => ({ ...prev, isTyping: false }));
      }
    }, 10);

    return () => clearInterval(typingIntervalRef.current);
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!selectedThread) return;

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        isBot: false,
        isNew: true,
      },
    ]);
    setIsWaitingForResponse(true);
    clearTimeout(thinkingTimeoutRef.current);

    thinkingTimeoutRef.current = setTimeout(() => {
      setTypingState({
        showIndicator: true,
        isTyping: false,
        typingMessage: "",
      });
      sendMessageToBot(message);
    }, 1000);
  };

  const sendMessageToBot = async (message) => {
    try {
      const botResponse = await sendMessage(selectedThread, message);
      setTypingState((prev) => ({ ...prev, showIndicator: false }));
      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
          isBot: true,
          isNew: true,
        },
      ]);
      if (messages.length === 2) {
        setIsWaitingForResponse(false);
        await updateThreadTitleById(selectedThread, null, true);
      }
    } catch (error) {
      console.error("Message sending failed:", error);
      setTypingState((prev) => ({ ...prev, showIndicator: false }));
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error sending your message. Please try again.",
          isBot: true,
          isNew: true,
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
          changeThread={handleThreadChange}
          selectedThread={selectedThread}
          onCreateThread={createThread}
          deleteThreadById={deleteThreadById}
          updateThreadTitleById={updateThreadTitleById}
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
