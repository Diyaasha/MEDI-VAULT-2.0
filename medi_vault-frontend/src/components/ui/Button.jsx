import React from "react";

const Button = ({ children, variant, size, onClick, className, type = "button" }) => {
  let baseStyle = "cursor-pointer font-semibold rounded ";

  let variantStyle = "";
  if (variant === "outline") {
    variantStyle = "border border-blue-600 text-blue-600 hover:bg-blue-50 ";
  } else {
    variantStyle = "bg-blue-600 text-white hover:bg-blue-700 ";
  }

  let sizeStyle = "";
  if (size === "sm") {
    sizeStyle = "text-sm px-3 py-1 ";
  } else {
    sizeStyle = "text-base px-4 py-2 ";
  }

  const combinedClass = baseStyle + variantStyle + sizeStyle + (className || "");

  return (
    <button type={type} className={combinedClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
