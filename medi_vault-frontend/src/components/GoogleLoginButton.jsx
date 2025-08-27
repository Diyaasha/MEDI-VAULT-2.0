import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        // Pass the id_token credential to your success handler
        onSuccess(credentialResponse.credential);
      }}
      onError={() => onError("Google login failed")}
      useOneTap // Optional, shows One Tap prompt
    />
  );
};

export default GoogleLoginButton;
