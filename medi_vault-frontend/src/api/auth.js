import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

export const signup = (formData) => API.post("/api/auth/signup", formData);
export const login = (formData) => API.post("/api/auth/login", formData);
export const googleVerify = (idToken) =>
  API.post("/api/auth/google/verify", { token: idToken });
