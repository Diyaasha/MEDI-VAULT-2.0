import React from "react";

const Modal = ({ isOpen, title, children, onClose, onVerify }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // Close modal on outside click
    >
      <div
        style={{
          background: "#c4c9d8ff",
          padding: "20px 30px",
          borderRadius: "8px",
          minWidth: "320px",
          maxWidth: "90%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h3 style={{ marginTop: 0, marginBottom: "18px" }}>{title}</h3>
        {children}
        <div style={{ marginTop: "15px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onVerify}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "10px 24px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Verify
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#dc3545",
              color: "#fff",
              padding: "10px 24px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
