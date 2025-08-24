import React, { useState } from "react";

export const Tabs = ({ children }) => {
  return <div>{children}</div>;
};

export const TabsList = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const TabsTrigger = ({ children, value, activeTab, onClick, className }) => {
  const isActive = value === activeTab;
  return (
    <button
      className={`${className} px-4 py-2 ${isActive ? "border-b-2 border-blue-600 font-semibold" : "text-gray-600"}`}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, activeTab }) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};
