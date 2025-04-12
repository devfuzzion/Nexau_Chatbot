import React, { useState, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown, Edit, Copy, Check, Send, Sun, Moon, Zap } from "lucide-react";
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
  threadId,
  userId,
  onSendMessage,
  toggleTheme
}) => {
  const { isTyping, typingMessage } = typingState;
  const [feedbackStates, setFeedbackStates] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const [showInitialUI, setShowInitialUI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const thinkingTimeoutRef = useRef(null);
  const thinkingIndicatorRef = useRef(null);
  const containerRef = useRef(null);

  // Reset showInitialUI when thread changes
  useEffect(() => {
    if (threadId) {
      // Only show initial UI if it's a new thread (no messages) and not loading
      setShowInitialUI(messages.length === 0 && !isLoading);
    }
  }, [threadId, messages.length, isLoading]);

  // Track loading state
  useEffect(() => {
    if (!threadId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Set loading to false when messages are loaded
    if (messages.length > 0 || (!isWaitingForResponse && !typingState.isTyping)) {
      setIsLoading(false);
    }
  }, [threadId, messages, isWaitingForResponse, typingState.isTyping]);

  // Fetch feedback states when component mounts or threadId changes
  useEffect(() => {
    const fetchFeedbackStates = async () => {
      try {
        const response = await fetch(
          `https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/feedback/states/${threadId}`,
        );
        const data = await response.json();
        if (data.success) {
          setFeedbackStates(data.feedbackStates);
        }
      } catch (error) {
        console.error("Error fetching feedback states:", error);
      }
    };

    if (threadId) {
      fetchFeedbackStates();
    }
  }, [threadId]);

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

  // Function to get feedback state for a specific message
  const getMessageFeedbackState = (messageId) => {
    return feedbackStates.find((state) => state.messageId === messageId);
  };

  // Function to handle like/dislike
  const handleLikeDislike = async (messageId, type) => {
    const isLiked = type === "I liked this message";
    console.log(userId, messageId, threadId, isLiked, 222);

    // Validate required fields
    if (!userId || !messageId || !threadId) {
      console.error("Missing required fields:", {
        userId,
        messageId,
        threadId,
        isLiked,
      });
      return;
    }

    try {
      // Update local state
      setFeedbackStates((prev) => {
        const filtered = prev.filter((state) => state.messageId !== messageId);
        return [...filtered, { messageId, isLiked }];
      });

      // Store in Airtable
      const response = await fetch(
        "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/feedback/state",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            messageId: messageId,
            threadId: threadId,
            isLiked: isLiked,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to store feedback state");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      // Call the parent handler
      await handleFeedback(messageId, type);
    } catch (error) {
      console.error("Error storing feedback state:", error);
      // Revert local state on error
      setFeedbackStates((prev) => {
        const filtered = prev.filter((state) => state.messageId !== messageId);
        return filtered;
      });
    }
  };

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

  const handleExampleClick = (text) => {
    if (onSendMessage) {
      onSendMessage(text);
      setShowInitialUI(false);
    }
  };

  return (
    <div
      className={`messages-container ${isExpanded ? "expanded" : ""}`}
      ref={containerRef}
      style={{ overflowY: "auto" }}
    >
      {!isLoading && showInitialUI && messages.length === 0 ? (
        <div className="initial-ui-container">
          <h2 className="initial-ui-title">Consultor IA</h2>
          
          <div className="sections-container">
            <div className={`section examples ${isExpanded ? "expanded" : ""}`}>
              <div className="section-header">
                <Sun size={24} />
                <h3>Ejemplos</h3>
              </div>
              <div className="section-content">
                <button 
                  className="example-btn"
                  onClick={() => handleExampleClick("Estas son las métricas de mi ecommerce, ¿cómo puedo mejorarlas?")}
                >
                  "Estas son las métricas de mi ecommerce, ¿cómo puedo mejorarlas?"
                </button>
                <button 
                  className="example-btn"
                  onClick={() => handleExampleClick("¿Cómo puedo diseñar la historia de mi ecommerce?")}
                >
                  "¿Cómo puedo diseñar la historia de mi ecommerce?"
                </button>
                <button 
                  className="example-btn"
                  onClick={() => handleExampleClick("Dame 10 ideas para crear mi email semanal")}
                >
                  "Dame 10 ideas para crear mi email semanal"
                </button>
              </div>
            </div>

            <div className={`section capabilities ${isExpanded ? "expanded" : ""}`}>
              <div className="section-header">
                <Zap size={24} />
                <h3>Capacidades</h3>
              </div>
              <div className="section-content">
                <div className="capability-item">
                  Recuerda lo que dices durante la conversación
                </div>
                <div className="capability-item">
                  Sabe cuál es tu ecommerce si pones tu información en la configuración
                </div>
                <div className="capability-item">
                  Está entrenado con toda la información de consultoría IA
                </div>
              </div>
            </div>
          </div>

          <div className="theme-selector">
            <button 
              className={`theme-btn ${!isDarkMode ? 'active' : ''}`}
              onClick={() => toggleTheme(false)}
            >
              <Sun size={16} />
              Modo Claro
            </button>
            <button 
              className={`theme-btn ${isDarkMode ? 'active' : ''}`}
              onClick={() => toggleTheme(true)}
            >
              <Moon size={16} />
              Modo Oscuro
            </button>
          </div>
        </div>
      ) : (
        <>
          { messages.length > 0 && messages.map((msg, index) => {
            const messageFeedback = getMessageFeedbackState(msg.id);

            return (
              <React.Fragment key={index}>
                <div
                  className={`message-container 
                    ${msg.isBot
                      ? "bot-message-container"
                      : "client-message-container"
                    }
                    ${isDarkMode ? "dark" : ""}
                    ${isExpanded ? "expanded" : ""}`}
                >
                  {msg.isBot ? (
                    <div className="markdown-preview">
                      {index === messages.length - 1 && isTyping ? (
                        <MarkdownPreview
                          className={`markdown-preview ${isDarkMode ? "dark" : ""}`}
                          source={typingMessage}
                        />
                      ) : (
                        <MarkdownPreview
                          className={`markdown-preview ${isDarkMode ? "dark" : ""}`}
                          source={msg.text}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="client-message-text">
                      {msg.text.split("User message:")[1]
                        ? msg.text.split("User message: ")[1]
                        : msg.text}
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
                          className={`feedback-textarea ${isDarkMode ? "dark" : ""
                            }`}
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
                          className={`feedback-btn ${messageFeedback?.isLiked ? "active" : ""
                            }`}
                          onClick={() =>
                            handleLikeDislike(msg.id, "I liked this message")
                          }
                          aria-label="Like this response"
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button
                          className={`feedback-btn ${messageFeedback?.isLiked === false ? "active" : ""
                            }`}
                          onClick={() =>
                            handleLikeDislike(msg.id, "I didn't liked this message")
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
            );
          })}
        </>
      )}

      {showThinkingIndicator && (
        <div
          ref={thinkingIndicatorRef}
          className={`message-container bot-message-container ${isDarkMode ? "dark" : ""
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
