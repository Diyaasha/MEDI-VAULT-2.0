// src/components/Modal.jsx
import React from "react";

const Modal = ({ isOpen, title, children, onClose }) => {
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
      onClick={onClose} // close on clicking outside modal content
    >
      <div
        style={{
          background: "white",
          padding: "20px 30px",
          borderRadius: "8px",
          minWidth: "320px",
          maxWidth: "90%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h3>{title}</h3>
        {children}
        <button 
          onClick={onClose} 
          style={{ marginTop: "10px", padding: "6px 12px" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Modal;
