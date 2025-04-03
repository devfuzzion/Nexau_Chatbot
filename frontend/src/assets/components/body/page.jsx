import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Footer from "../footer/page.jsx";
import LeftColumn from "../leftcolumn/page.jsx";
import {
  fetchMessages,
  sendMessage,
  appendFeedbackMessage,
} from "../../../api/chatService.js";
import { useTheme } from "../../../hooks/useTheme.js";
import MessageList from "../messageList/messageList.page.jsx";

const Body = ({
  isExpanded,
  threads,
  setThreads,
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

  const handleSendMessage = async (message, file = null) => {
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
      sendMessageToBot(message, file);
    }, 1000);
  };

  const sendMessageToBot = async (message, file = null) => {
    try {
      const thread = threads.find(
        (thread) => thread.threadid === selectedThread,
      );
      if (!thread) {
        console.error("Thread not found");
        return;
      }
      const threadFeedback = thread.feedback ?? ""; // Get the existing feedback
      // console.log(thread);
      // console.log(threadFeedback, 4444);
      const formattedMessage = `User feedback: ${threadFeedback}\nUser message: ${message}`;

      const botResponse = await sendMessage(
        selectedThread,
        formattedMessage,
        file,
      );
      setTypingState((prev) => ({ ...prev, showIndicator: false }));
      setMessages((prev) => [
        ...prev,
        {
          text: botResponse.botMessage,
          isBot: true,
          isNew: true,
          id: botResponse.messageId,
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

  const handleFeedback = async (messageId, feedback) => {
    if (!selectedThread) return;

    const thread = threads.find((thread) => thread.threadid === selectedThread);
    if (!thread) {
      console.error("Thread not found");
      return;
    }

    const originalFeedback = thread.feedback ?? ""; // Get the existing feedback

    try {
      const updatedFeedback = await appendFeedbackMessage(
        selectedThread, // Thread ID
        messageId, // Message ID
        feedback, // New feedback
        originalFeedback, // Previous feedback
      );
      setThreads((threads) =>
        threads.map((el) =>
          el.threadid === thread.threadid
            ? { ...el, feedback: updatedFeedback.updatedFeedback }
            : el,
        ),
      );
      console.log("Updated Feedback:", updatedFeedback);
    } catch (error) {
      console.error("Failed to update feedback:", error);
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
          selectedThread={selectedThread}
          handleFeedback={handleFeedback}
        />
        <Footer
          onSendMessage={handleSendMessage}
          isDarkMode={isDarkMode}
          isExpanded={isExpanded}
          isDisabled={
            !selectedThread ||
            isWaitingForResponse ||
            typingState.isTyping ||
            typingState.showIndicator
          }
        />
      </div>
    </div>
  );
};

export default Body;
