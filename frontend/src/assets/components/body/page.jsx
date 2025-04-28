import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Footer from "../footer/page.jsx";
import LeftColumn from "../leftcolumn/page.jsx";
import {
  fetchMessages,
  sendMessage,
  appendFeedbackMessage,
} from "../../../api/chatService.js";
import MessageList from "../messageList/messageList.page.jsx";
import ProfileOverlay from "../profile/page.jsx";

const Body = ({
  userData,
  setUserData,
  handleProfileOpen,
  isProfileOpen,
  isExpanded,
  threads,
  setThreads,
  selectedThread,
  setSelectedThread,
  createThread,
  deleteThreadById,
  updateThreadTitleById,
  isDarkMode,
  toggleTheme,
}) => {
  // Message state
  const [messages, setMessages] = useState([]);
  const [typingState, setTypingState] = useState({
    isTyping: false,
    typingMessage: "",
    showIndicator: false,
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [userId, setUserId] = useState(localStorage.getItem('userId') || "guest");

  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const thinkingTimeoutRef = useRef(null);

  const handleThreadChange = async (threadId) => {
    // First clear any existing intervals and timeouts
    clearInterval(typingIntervalRef.current);
    clearTimeout(thinkingTimeoutRef.current);

    // Reset typing state
    setTypingState({
      isTyping: false,
      typingMessage: "",
      showIndicator: false,
    });

    // If profile is open, close it first
    if (isProfileOpen) {
      handleProfileOpen();
    }

    // Set the new thread first
    setSelectedThread(threadId);

    // Load messages for the new thread
    try {
      const messageData = await fetchMessages(threadId);
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

  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messageData = await fetchMessages(selectedThread);
        // Only update messages if we're still on the same thread
        // if (selectedThread === messageData[0]?.threadId) {
          setMessages(messageData.map((msg) => ({ ...msg, isNew: false })));
        // }
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
      console.log("selectedThread",selectedThread);
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
      const formattedMessage = `User Info:
      You can use this to generate the response but no need to mention it to the user that you know this without him asking
      - Store Name: ${userData?.storename || "N/A"}
      - Website: ${userData?.website || "N/A"}
      - Products: ${userData?.products || "N/A"}
      - Story: ${userData?.story || "N/A"}

      User feedback: ${threadFeedback}
      User message: ${message}`;

      const botResponse = await sendMessage(
        selectedThread,
        formattedMessage,
        userId,
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
      console.log("messages",messages.length,messages);
      if (messages.length === 2) {
        console.log("Generating thread title from openai");
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
        userId,
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

  const handleCloseProfile = () => {
    if (isProfileOpen) {
      handleProfileOpen();
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
          userData={userData}
          setUserData={setUserData}
          handleProfileOpen={handleProfileOpen}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          threads={threads}
          changeThread={handleThreadChange}
          selectedThread={selectedThread}
          onCreateThread={createThread}
          deleteThreadById={deleteThreadById}
          updateThreadTitleById={updateThreadTitleById}
          isProfileOpen={isProfileOpen}
          onCloseProfile={handleCloseProfile}
        />
      )}

      <div className={`main-content ${isDarkMode ? "dark" : ""}`}>
        {isProfileOpen ? (
          <ProfileOverlay
            setUserData={setUserData}
            userData={userData}
            isDarkMode={isDarkMode}
            isVisible={isProfileOpen}
            onClose={handleProfileOpen}
          />
        ) : (
          <>
            <MessageList
              messages={messages}
              userId={userId}
              threadId={selectedThread}
              isDarkMode={isDarkMode}
              isExpanded={isExpanded}
              typingState={typingState}
              messagesEndRef={messagesEndRef}
              isWaitingForResponse={isWaitingForResponse}
              selectedThread={selectedThread}
              handleFeedback={handleFeedback}
              onSendMessage={handleSendMessage}
              toggleTheme={toggleTheme}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Body;
