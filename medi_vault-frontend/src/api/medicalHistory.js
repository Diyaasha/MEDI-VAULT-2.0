import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper to add Authorization header with user token
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const medicalHistoryApi = {
  getMedicalRecords: async (token, search = "", filter = "all") => {
    const url = `${API_URL}/api/medical-history`;
    const params = {};
    if (search) params.search = search;
    if (filter && filter !== "all") params.type = filter;
    const res = await axios.get(url, { ...getAuthHeaders(token), params });
    return res.data;
  },

  getVitalStats: async (token) => {
    // Assuming backend endpoint exists for vitals, else mock or adjust accordingly
    const url = `${API_URL}/api/user/profile`; // or a vitals endpoint
    const res = await axios.get(url, getAuthHeaders(token));
    // Transform user profile fields to vital stats array if needed
    // For now, just return an example structure or empty array:
    return [
      { label: "Blood Pressure", value: "120/80", status: "normal", icon: require("lucide-react/Heart").default, trend: "stable" },
      { label: "Heart Rate", value: "72 bpm", status: "normal", icon: require("lucide-react/Activity").default, trend: "stable" },
      { label: "Temperature", value: "98.6°F", status: "normal", icon: require("lucide-react/Thermometer").default, trend: "stable" },
      { label: "Weight", value: "165 lbs", status: "normal", icon: require("lucide-react/Weight").default, trend: "down" },
    ];
  },

  getReminders: async (token) => {
    const url = `${API_URL}/api/medicine-reminders`;
    const res = await axios.get(url, getAuthHeaders(token));
    return res.data.map(reminder => ({
      ...reminder,
      icon:
        reminder.type === "appointment" ? require("lucide-react/Calendar").default :
        reminder.type === "medication" ? require("lucide-react/Pill").default :
        require("lucide-react/Activity").default, // fallback icon
    }));
  },

  // Add other API calls like uploadDocument, downloadDocument, updateRecord, etc., as needed
};

export default medicalHistoryApi;
