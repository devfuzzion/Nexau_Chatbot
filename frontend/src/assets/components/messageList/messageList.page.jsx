import React, { useState, useEffect, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Edit,
  Copy,
  Check,
  Send,
  Sun,
  Moon,
  Zap,
  FileText,
} from "lucide-react";
import TypingIndicator from "../typingIndicator/typingIndicator.page.jsx";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "./messageList.css";
import { marked } from "marked";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { MathJax } from "better-react-mathjax";
import { BlockMath, InlineMath } from "react-katex";
import { rehypeExternalLinks } from "./customRehypeLinkPlugin"; // adjust path if needed

// import { InlineMath, BlockMath } from 'react-katex';
import {
  fetchFeedbackStates,
  fetchDocumentUploads,
  storeFeedbackState,
} from "./../../../api/chatService.js";

// Helper function to remove text wrapped in 【】
const removeBracketedText = (line) => {
  return line.replace(/【.*?】/g, "");
};

// Helper function to count backslashes in a line
const countBackslashes = (line) => {
  return (line.match(/\\/g) || []).length;
};

// Helper function to check if a line contains math formula
const containsMathFormula = (line, index, lines) => {
  const backslashCount = countBackslashes(line);

  // Check all three conditions using OR
  return (
    // Condition 1: Line is between \\[ and \\]
    (index > 0 &&
      index < lines.length - 1 &&
      lines[index - 1].includes("\\[") &&
      lines[index + 1].includes("\\]")) ||
    // Condition 2: Line has more than two pairs of backslashes
    backslashCount > 4 ||
    // Condition 3: Line has more than one backslash
    backslashCount > 1
  );
};

// Helper function to check if line should be skipped
const shouldSkipLine = (line) => {
  return line.includes("\\[") || line.includes("\\]");
};

// Function to extract math formula from a line
const extractMathFormula = (line) => {
  return line.trim();
};

// Function to split content into math and non-math parts
const splitContent = (text) => {
  if (!text) return [];
  const lines = text.split("\n");
  // console.log("lines", lines);
  const result = [];
  let currentGroup = { type: "text", content: "" };

  lines.forEach((line, index) => {
    // Remove text wrapped in 【】
    line = removeBracketedText(line);

    // Skip lines containing \\[ or \\]
    if (shouldSkipLine(line)) {
      return;
    }

    if (containsMathFormula(line, index, lines)) {
      const mathFormula = extractMathFormula(line);
      if (mathFormula) {
        if (currentGroup.content) {
          result.push(currentGroup);
        }
        result.push({ type: "math", content: mathFormula });
        currentGroup = { type: "text", content: "" };
      } else {
        currentGroup.content += (currentGroup.content ? "\n" : "") + line;
      }
    } else {
      currentGroup.content += (currentGroup.content ? "\n" : "") + line;
    }
  });

  if (currentGroup.content) {
    result.push(currentGroup);
  }

  return result;
};

// Component to render mixed content
const MixedContent = ({ content, isDarkMode }) => {
  const parts = splitContent(content);

  // Helper to copy TeX to clipboard
  const copyTeX = (tex) => {
    navigator.clipboard.writeText(tex);
  };

  return (
    <div className="mixed-content">
      {parts.map((part, index) => {
        if (part.type === "math") {
          return (
            <div
              key={index}
              className={`math-content ${isDarkMode ? "dark" : ""}`}
            >
              <BlockMath math={part.content} />
            </div>
          );
        } else {
          return (
            <div key={index} className="markdown-content">
              <MarkdownPreview
                className={`markdown-preview ${isDarkMode ? "dark" : ""}`}
                source={part.content}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeExternalLinks]}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

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
  toggleTheme,
}) => {
  const { isTyping, typingMessage } = typingState;
  const [feedbackStates, setFeedbackStates] = useState([]);
  const [documentUploads, setDocumentUploads] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const [showInitialUI, setShowInitialUI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const thinkingTimeoutRef = useRef(null);
  const thinkingIndicatorRef = useRef(null);
  const containerRef = useRef(null);
  const typingSpeed = 1; // Reduced to 1 for super fast typing

  // Reset showInitialUI when thread changes
  useEffect(() => {
    if (threadId) {
      // Only show initial UI if it's a new thread (no messages) and not loading
      setShowInitialUI(messages.length === 0 && !isLoading);

      // Reset states when thread changes
      setFeedbackStates([]);
      setDocumentUploads([]);
      setCopiedIndex(null);
      setEditingIndex(null);
      setFeedbackText("");
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
    if (
      messages.length > 0 ||
      (!isWaitingForResponse && !typingState.isTyping)
    ) {
      setIsLoading(false);
    }
  }, [threadId, messages, isWaitingForResponse, typingState.isTyping]);

  // Fetch feedback states when component mounts or threadId changes
  useEffect(() => {
    const loadFeedbackStates = async () => {
      if (!threadId) return;

      try {
        const response = await fetch(
          // `https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/feedback/states/${threadId}/${userId}`,
          // `http://localhost:3000/feedback/states/${threadId}/${userId}`,
          `https://nexau.devfuzzion.com/api/feedback/states/${threadId}/${userId}`,
        );
        const data = await response.json();
        if (data.success) {
          setFeedbackStates(data.feedbackStates);
        }
      } catch (error) {
        console.error("Error fetching feedback states:", error);
      }
    };

    loadFeedbackStates();
  }, [threadId, userId]);

  // Update documentUploads when new messages arrive
  useEffect(() => {
    const updateDocumentUploads = async () => {
      try {
        const response = await fetch(
          // `http://localhost:3000/documents/${threadId}/${userId}`,
          // `https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/documents/${threadId}/${userId}`,
          `https://nexau.devfuzzion.com/api/documents/${threadId}/${userId}`,
        );
        const data = await response.json();
        if (data.success) {
          setDocumentUploads(data.documentUploads);
        }
      } catch (error) {
        console.error("Error fetching document uploads:", error);
      }
    };

    updateDocumentUploads();
  }, [threadId, messages]); // Add messages as a dependency

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

  // Function to get document info for a message
  const getMessageDocument = (messageId, messageText) => {
    // First check in documentUploads for historical messages
    const storedDocument = documentUploads.find(
      (doc) => doc.messageId === messageId,
    );
    if (storedDocument) {
      return storedDocument;
    }

    // For new messages, check if there's document info in the message text
    if (messageText && messageText.includes("document:")) {
      const parts = messageText.split("\nUser message:");
      if (parts[0] && parts[0].includes("document:")) {
        const documentInfo = parts[0].split("document:")[1].trim();
        return {
          documentName: documentInfo,
          messageId: messageId,
        };
      }
    }
    return null;
  };

  // Function to clean message text
  const getCleanMessageText = (messageText) => {
    if (!messageText) return "";

    // If message contains document info, extract only the user message part
    if (
      messageText.includes("document:") &&
      messageText.includes("\nUser message:")
    ) {
      const parts = messageText.split("\nUser message:");
      return parts[1] ? parts[1].trim() : messageText;
    }

    // For messages without document info or regular messages
    return messageText.split("User message:")[1]
      ? messageText.split("User message:")[1].trim()
      : messageText;
  };

  // Function to handle like/dislike
  const handleLikeDislike = async (messageId, type) => {
    const isLiked = type === "I liked this message";

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

      // Store in Airtable - include the feedback text in the same request
      const response = await fetch(
        // "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev/feedback/state",
        // "http://localhost:3000/feedback/state",
        `https://nexau.devfuzzion.com/api/feedback/state`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "guest",
            messageId: messageId,
            threadId: threadId,
            isLiked: isLiked,
            feedbackText: type, // Include the feedback text here
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

      // No need to call handleFeedback separately, it's all handled in one record now
    } catch (error) {
      console.error("Error storing feedback state:", error);
      // Revert local state on error
      setFeedbackStates((prev) => {
        const filtered = prev.filter((state) => state.messageId !== messageId);
        return filtered;
      });
    }
  };

  function convertMarkdownToPlainText(markdown) {
    if (!markdown) return "";

    return (
      markdown
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "")
        // Remove inline code
        .replace(/`([^`]+)`/g, "$1")
        // Remove images ![alt](url)
        .replace(/!\[.*?\]\(.*?\)/g, "")
        // Convert links [text](url) → text
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        // Headers (e.g., # Heading) → just text
        .replace(/^#+\s*(.*)/gm, "$1")
        // Bold and italic (**text**, *text*, _text_)
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        // Strikethrough
        .replace(/~~(.*?)~~/g, "$1")
        // Blockquotes
        .replace(/^>\s+/gm, "")
        // Lists (bullets and numbered)
        .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
        // Remove extra newlines and trim
        .replace(/\n{2,}/g, "\n")
        .trim()
    );
  }

  const handleCopy = async (text, index) => {
    try {
      console.log("Original markdown:", text);

      // Process math expressions separately to preserve them
      const processedText = text.replace(
        /\(\s*(\\[a-zA-Z]+\(.+?\)|.+?)\s*\)/g,
        "$$1$",
      );
      text = text.replaceAll("【30:0†source】", "");
      // Convert markdown to HTML using marked
      const html = marked.parse(text);

      // Get plain text version (for fallback and text/plain)
      const plainText = convertMarkdownToPlainText(processedText);

      const hasClipboardItem = typeof ClipboardItem !== "undefined";

      if (
        navigator.clipboard &&
        navigator.clipboard.write &&
        hasClipboardItem
      ) {
        // Modern clipboard API with format support
        try {
          // Create blobs for different formats
          const plainBlob = new Blob([plainText], { type: "text/plain" });
          const htmlBlob = new Blob([html], { type: "text/html" });
          const markdownBlob = new Blob([text], { type: "text/markdown" });

          // Try to write with all formats for best cross-platform support
          const clipboardItem = new ClipboardItem({
            "text/plain": plainBlob,
            "text/html": htmlBlob,
            "text/markdown": markdownBlob,
          });

          await navigator.clipboard.write([clipboardItem]);
          console.log("Copied using ClipboardItem with multiple formats");
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        } catch (clipErr) {
          console.warn(
            "Enhanced clipboard copy failed, trying HTML only:",
            clipErr,
          );
          // Fallback to simpler format combination
          const plainBlob = new Blob([plainText], { type: "text/plain" });
          const htmlBlob = new Blob([html], { type: "text/html" });

          await navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": plainBlob,
              "text/html": htmlBlob,
            }),
          ]);

          console.log("Copied using ClipboardItem with HTML and plain text");
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        }
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // For Mac, ensure we're using the original markdown text
        // This helps maintain formatting when pasting into markdown editors
        await navigator.clipboard.writeText(text);
        console.log("Fallback: Copied using writeText with original markdown");
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        // Last resort fallback
        copyTextFallback(text, index);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      // If all else fails, try with the original markdown text
      copyTextFallback(text, index);
    }
  };

  // Fallback method for copying text
  const copyTextFallback = (text, index) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        console.log("Copy successful using execCommand fallback");
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        console.error("Fallback clipboard copy failed");
      }
    } catch (error) {
      console.error("Fallback copy method failed:", error);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setFeedbackText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setFeedbackText("");
  };

  const submitFeedback = async (messageId) => {
    cancelEditing();
    if (feedbackText.trim()) {
      try {
        // Just use handleFeedback which will now properly update existing records
        await handleFeedback(messageId, feedbackText.trim());
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    }
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
      {!isLoading && isExpanded && showInitialUI && messages.length === 0 ? (
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
                  onClick={() =>
                    handleExampleClick(
                      "Estas son las métricas de mi ecommerce, ¿cómo puedo mejorarlas?",
                    )
                  }
                >
                  "Estas son las métricas de mi ecommerce, ¿cómo puedo
                  mejorarlas?"
                </button>
                <button
                  className="example-btn"
                  onClick={() =>
                    handleExampleClick(
                      "¿Cómo puedo diseñar la historia de mi ecommerce?",
                    )
                  }
                >
                  "¿Cómo puedo diseñar la historia de mi ecommerce?"
                </button>
                <button
                  className="example-btn"
                  onClick={() =>
                    handleExampleClick(
                      "Dame 10 ideas para crear mi email semanal",
                    )
                  }
                >
                  "Dame 10 ideas para crear mi email semanal"
                </button>
              </div>
            </div>

            <div
              className={`section capabilities ${isExpanded ? "expanded" : ""}`}
            >
              <div className="section-header">
                <Zap size={24} />
                <h3>Capacidades</h3>
              </div>
              <div className="section-content">
                <div className="capability-item">
                  Recuerda lo que dices durante la conversación
                </div>
                <div className="capability-item">
                  Sabe cuál es tu ecommerce si pones tu información en la
                  configuración
                </div>
                <div className="capability-item">
                  Está entrenado con toda la información de consultoría IA
                </div>
              </div>
            </div>
          </div>

          <div className="theme-selector">
            <button
              className={`theme-btn ${!isDarkMode ? "active" : ""}`}
              onClick={() => toggleTheme(false)}
            >
              <Sun size={16} />
              Modo Claro
            </button>
            <button
              className={`theme-btn ${isDarkMode ? "active" : ""}`}
              onClick={() => toggleTheme(true)}
            >
              <Moon size={16} />
              Modo Oscuro
            </button>
          </div>
        </div>
      ) : (
        <>
          {messages.length > 0 &&
            messages.map((msg, index) => {
              const messageFeedback = getMessageFeedbackState(msg.id);
              const messageDocument = getMessageDocument(msg.id, msg.text);

              return (
                <React.Fragment key={index}>
                  {messageDocument && (
                    <div className="document-container">
                      <div
                        className={`document-pill ${
                          isExpanded ? "expanded" : ""
                        }`}
                      >
                        <FileText size={16} />
                        <span className="document-name">
                          {messageDocument.documentName
                            ? messageDocument.documentName.length > 30
                              ? messageDocument.documentName.slice(0, 30) +
                                "..."
                              : messageDocument.documentName
                            : ""}
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`message-container 
                    ${
                      msg.isBot
                        ? "bot-message-container"
                        : "client-message-container"
                    }
                    ${isDarkMode ? "dark" : ""}
                    ${isExpanded ? "expanded" : ""}`}
                  >
                    {msg.isBot ? (
                      <div className="markdown-preview">
                        {index === messages.length - 1 && isTyping ? (
                          <MixedContent
                            content={typingMessage}
                            isDarkMode={isDarkMode}
                          />
                        ) : (
                          <MixedContent
                            content={msg.text}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="client-message-content">
                        <div className="client-message-text">
                          {getCleanMessageText(msg.text)}
                        </div>
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
                            className={`feedback-textarea ${
                              isDarkMode ? "dark" : ""
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
                            className={`feedback-btn ${
                              messageFeedback?.isLiked ? "active" : ""
                            }`}
                            onClick={() =>
                              handleLikeDislike(msg.id, "I liked this message")
                            }
                            aria-label="Like this response"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            className={`feedback-btn ${
                              messageFeedback?.isLiked === false ? "active" : ""
                            }`}
                            onClick={() =>
                              handleLikeDislike(
                                msg.id,
                                "I didn't liked this message",
                              )
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
          className={`message-container bot-message-container ${
            isDarkMode ? "dark" : ""
          } ${isExpanded ? "expanded" : ""}`}
        >
          <TypingIndicator text="Pensando..." speed={typingSpeed} />
        </div>
      )}

      <div ref={messagesEndRef} style={{ height: "0px" }} />
    </div>
  );
};

export default MessageList;

// Add these styles to your CSS
const styles = `
.document-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-size: 14px;
}

.document-attachment.dark {
  background-color: rgba(255, 255, 255, 0.1);
}

.document-name {
  color: inherit;
  text-decoration: none;
}

.client-message-container {
  display: flex;
  flex-direction: column;
}
`;
