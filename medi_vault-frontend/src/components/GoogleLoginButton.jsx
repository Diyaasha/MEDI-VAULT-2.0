import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [isErrored, setIsErrored] = useState(false);

  const handleError = (error) => {
    console.error("Google login error:", error);
    setIsErrored(true);
    onError("Google login is not configured for this origin. Please use email login instead.");
  };

  // Don't show Google button if it's errored
  if (isErrored) {
    return (
      <div style={{ color: "#999", fontSize: "14px", marginTop: "10px" }}>
        <p>Google Sign-In is not available in development. Use email login instead.</p>
      </div>
    );
  }

  return (
    <div onError={() => handleError("origin_mismatch")}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          onSuccess(credentialResponse.credential);
        }}
        onError={() => handleError("google_signin_failed")}
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleLoginButton;
