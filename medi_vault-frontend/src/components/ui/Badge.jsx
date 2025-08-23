import React from "react";

const Badge = ({ children, variant }) => {
  let baseStyle = "inline-block px-2 py-1 rounded text-xs font-semibold ";
  let variantStyle = "bg-gray-200 text-gray-700";

  if (variant === "secondary") {
    variantStyle = "bg-blue-200 text-blue-800";
  } else if (variant === "destructive") {
    variantStyle = "bg-red-200 text-red-800";
  } else if (variant === "outline") {
    baseStyle = baseStyle + "border border-gray-400";
    variantStyle = "text-gray-700 bg-white";
  }

  return <span className={baseStyle + variantStyle}>{children}</span>;
};

export default Badge;
