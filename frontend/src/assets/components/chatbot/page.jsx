import React, { useState, useEffect } from "react";
import Header from "../header/page.jsx";
import Body from "../body/page.jsx";
import { Infinity } from "lucide-react";
import "./index.css";

const Chatbot = () => {
  // Initialize states from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('isExpanded') === 'true';
  });
  
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('isVisible') !== 'false'; // Default to true if not set
  });

  // Persist states to localStorage when they change
  useEffect(() => {
    localStorage.setItem('isExpanded', isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('isVisible', isVisible);
  }, [isVisible]);

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
  };

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
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