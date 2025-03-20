import React, { useState } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import { Infinity } from "lucide-react"; // Import the Infinity icon
import "./index.css";

const Chatbot = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

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
        <Body isExpanded={isExpanded} />
      </div>
    </>
  );
};

export default Chatbot;
