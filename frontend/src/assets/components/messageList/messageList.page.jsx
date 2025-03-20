import React from "react";
import TypingIndicator from "../typingIndicator/typingIndicator.page.jsx";

const MessageList = ({
  messages,
  isDarkMode,
  isExpanded,
  typingState,
  messagesEndRef,
  isWaitingForResponse,
}) => {
  const { isTyping, typingMessage } = typingState;

  return (
    <div className={`messages-container ${isExpanded ? "expanded" : ""}`}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message-container 
            ${msg.isBot ? "bot-message-container" : "client-message-container"}
            ${isDarkMode ? "dark" : ""}
            ${isExpanded ? "expanded" : ""}`}
        >
          {msg.isBot && index === messages.length - 1 && isTyping
            ? typingMessage
            : msg.text}
        </div>
      ))}

      {/* Show thinking indicator immediately after client sends a message */}
      {isWaitingForResponse && (
        <div
          className={`message-container bot-message-container ${
            isDarkMode ? "dark" : ""
          } ${isExpanded ? "expanded" : ""}`}
        >
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default MessageList;
