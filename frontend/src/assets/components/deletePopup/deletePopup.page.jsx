import React from "react";
import { X } from "lucide-react";

const DeleteConfirmationPopup = ({ show, onCancel, onConfirm, deleting }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="delete-confirmation-popup">
        <div className="popup-header">
          <h3>Eliminar conversación</h3>
          <button
            onClick={onCancel}
            className="close-button"
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          ¿Estás seguro de que quieres eliminar esta conversación? Esta acción
          no se puede deshacer.
        </p>
        <div className="popup-buttons">
          <button
            onClick={onCancel}
            className="cancel-button"
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="confirm-button"
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Borrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
