import React, { useRef, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

const ThreadMenuPopup = ({ onRename, onDelete, isDarkMode, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`thread-menu-popup ${isDarkMode ? "dark" : ""}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="menu-item"
      >
        <Pencil size={16} />
        <span>Renombrar</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="menu-item"
      >
        <Trash2 size={16} />
        <span>Borrar</span>
      </button>
    </div>
  );
};

export default ThreadMenuPopup;
