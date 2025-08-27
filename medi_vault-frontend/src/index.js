import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="433885290039-k1ecd5ekf91d4orovogoo8b4e9ta1fan.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
