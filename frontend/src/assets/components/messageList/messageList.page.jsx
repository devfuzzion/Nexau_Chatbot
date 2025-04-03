import React, { useState, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown, Edit, Copy, Check, Send } from "lucide-react";
import TypingIndicator from "../typingIndicator/typingIndicator.page.jsx";
import MarkdownPreview from "@uiw/react-markdown-preview";

const MessageList = ({
  messages,
  isDarkMode,
  isExpanded,
  typingState,
  messagesEndRef,
  isWaitingForResponse,
  handleFeedback,
}) => {
  const { isTyping, typingMessage } = typingState;
  const [feedbackStates, setFeedbackStates] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const thinkingTimeoutRef = useRef(null);
  const thinkingIndicatorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isWaitingForResponse) {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }

      thinkingTimeoutRef.current = setTimeout(() => {
        setShowThinkingIndicator(true);
      }, 1000);
    } else {
      setShowThinkingIndicator(false);
    }
  }, [isWaitingForResponse]);

  const scrollToAbsoluteBottom = () => {
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    scrollToAbsoluteBottom();
  }, [showThinkingIndicator, messages, isTyping]);

  // const handleFeedback = (messageId, feedbackType) => {
  //   setFeedbackStates((prev) => ({
  //     ...prev,
  //     [messageId]: feedbackType,
  //   }));
  //   console.log(`Feedback for message ${messageId}: ${feedbackType}`);
  // };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setFeedbackText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setFeedbackText("");
  };

  const submitFeedback = (messageId) => {
    if (feedbackText.trim()) {
      handleFeedback(messageId, feedbackText.trim());
    }
    cancelEditing();
  };
  // console.log(messagess);
  return (
    <div
      className={`messages-container ${isExpanded ? "expanded" : ""}`}
      ref={containerRef}
      style={{ overflowY: "auto" }}
    >
      {messages.map((msg, index) => (
        <React.Fragment key={index}>
          <div
            className={`message-container 
              ${msg.isBot ? "bot-message-container" : "client-message-container"}
              ${isDarkMode ? "dark" : ""}
              ${isExpanded ? "expanded" : ""}`}
          >
            {msg.isBot ? (
              <div className="markdown-preview">
                {index === messages.length - 1 && isTyping ? (
                  <MarkdownPreview className={`${isDarkMode ? "markdown-preview-dark" : "markdown-preview" }`} source={typingMessage} />
            ) : (
                  <MarkdownPreview className={`${isDarkMode ? "markdown-preview-dark" : "markdown-preview" }`} source={msg.text} />
                )}
              </div>
            ) : (
              <div className="client-message-text">
                {msg.text}
              </div>
            )}
          </div>
          {msg.isBot && !isTyping && (
            <div className={`feedback-row ${isDarkMode ? "dark" : ""}`}>
              {editingIndex === index ? (
                <div className="feedback-edit-container">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className={`feedback-textarea ${isDarkMode ? "dark" : ""}`}
                    placeholder="envíanos un comentario..."
                    autoFocus
                  />
                  <div className="feedback-edit-buttons">
                    <button
                      className="feedback-btn cancel-btn"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                    <button
                      className="feedback-btn submit-btn"
                      onClick={() => submitFeedback(msg.id)}
                      disabled={!feedbackText.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="feedback-container">
                  <button
                    className={`feedback-btn ${
                      feedbackStates[index] === "like" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleFeedback(msg.id, "I liked this message")
                    }
                    aria-label="Like this response"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    className={`feedback-btn ${
                      feedbackStates[index] === "dislike" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleFeedback(msg.id, "I didn't liked this message")
                    }
                    aria-label="Dislike this response"
                  >
                    <ThumbsDown size={16} />
                  </button>
                  <button
                    className="feedback-btn edit-btn"
                    onClick={() => startEditing(index)}
                    aria-label="Edit this response"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="feedback-btn copy-btn"
                    onClick={() => handleCopy(msg.text, index)}
                    aria-label="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <Check size={16} className="copied-icon" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}

      {showThinkingIndicator && (
        <div
          ref={thinkingIndicatorRef}
          className={`message-container bot-message-container ${
            isDarkMode ? "dark" : ""
          } ${isExpanded ? "expanded" : ""}`}
        >
          <TypingIndicator text="Pensando..." />
        </div>
      )}

      <div ref={messagesEndRef} style={{ height: "0px" }} />
    </div>
  );
};

export default MessageList;
