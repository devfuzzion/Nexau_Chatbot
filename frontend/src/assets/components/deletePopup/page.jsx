import React from "react";
import { X } from "lucide-react";

const DeleteConfirmationPopup = ({
  show,
  onCancel,
  onConfirm,
  deleting,
}) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="delete-confirmation-popup">
        <div className="popup-header">
          <h3>Delete Conversation</h3>
          <button
            onClick={onCancel}
            className="close-button"
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          Are you sure you want to delete this conversation? This action
          cannot be undone.
        </p>
        <div className="popup-buttons">
          <button
            onClick={onCancel}
            className="cancel-button"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="confirm-button"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;