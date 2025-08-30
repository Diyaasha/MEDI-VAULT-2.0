import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

// Attach token for authorization
API.interceptors.request.use(config => {
  const user = localStorage.getItem("user");
  if (user) {
    const token = JSON.parse(user).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Vaccinations API calls
export const fetchVaccinations = () => API.get("/api/vaccinations");
export const createVaccination = (data) => API.post("/api/vaccinations", data);
export const updateVaccination = (id, data) => API.put(`/api/vaccinations/${id}`, data);
export const deleteVaccination = (id) => API.delete(`/api/vaccinations/${id}`);

// Surgeries API calls
export const fetchSurgeries = () => API.get("/api/surgeries");
export const createSurgery = (data) => API.post("/api/surgeries", data);
export const updateSurgery = (id, data) => API.put(`/api/surgeries/${id}`, data);
export const deleteSurgery = (id) => API.delete(`/api/surgeries/${id}`);
