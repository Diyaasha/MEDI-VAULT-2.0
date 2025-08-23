import React from "react";

const Card = ({ children, className }) => {
  return (
    <div
      className={`border border-gray-300 rounded-md shadow-sm bg-white p-4 ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default Card;
