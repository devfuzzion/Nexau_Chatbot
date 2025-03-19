import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import { Infinity } from "lucide-react"; // Import the Infinity icon
import "./index.css";

const Chatbot = ({ threadId = "thread_YX9jzhPXH5LlaogOqd7yi8lJ" }) => {
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  // Fetch messages from API when chatbot opens
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/threads/${threadId}`,
        );
        const data = await response.json();

        if (data.success) {
          const formattedMessages = data.messages.reverse().map((msg) => ({
            text: msg.content[0].text.value, // Extract the text from the API response
            isBot: msg.role === "assistant",
          }));
          setMessages(formattedMessages);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [threadId]);

  // Function to send a user message and receive a bot response
  const addClientMessage = async (message) => {
    // Add user message to state
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, isBot: false },
    ]);

    try {
      // Send request to API
      const response = await fetch(`http://localhost:3000/run/${threadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: message }),
      });

      const data = await response.json();

      if (data.success && data.botMessage) {
        // Extract bot response and add it to chat
        const botReply = {
          text: data.botMessage.content[0].text.value, // Extract bot's text response
          isBot: true,
        };

        setMessages((prevMessages) => [...prevMessages, botReply]);
      } else {
        console.error("Bot response error:", data);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Error processing your request. Please try again.",
            isBot: true,
          },
        ]);
      }
    } catch (error) {
      console.error("API call failed:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Network error. Please check your connection.", isBot: true },
      ]);
    }
  };

  const handleExpand = () => {
    console.log("Expanded:", !isExpanded);
    setIsExpanded(!isExpanded);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible); // Toggle visibility
  };

  return (
    <>
      {/* Infinity Button (visible only when chatbot is hidden) */}
      {!isVisible && (
        <button className="infinity-button" onClick={toggleVisibility}>
          <Infinity size={30} />
        </button>
      )}

      {/* Chatbot Container */}
      <div
        className={`chatbot-container ${isExpanded ? "expanded" : ""} ${
          isVisible ? "" : "hidden"
        }`}
      >
        <Header
          onExpand={handleExpand}
          isExpanded={isExpanded}
          onToggleVisibility={toggleVisibility}
        />
        <Body
          messages={messages}
          onSendMessage={addClientMessage}
          isExpanded={isExpanded}
        />
      </div>
    </>
  );
};

export default Chatbot;
