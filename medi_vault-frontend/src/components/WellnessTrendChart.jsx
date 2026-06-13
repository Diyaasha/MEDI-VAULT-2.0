import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://medi-vault-zsg1.onrender.com');

export default function WellnessTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/wellness-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load wellness logs");
        }
        const logs = await res.json();

        // Transform logs into chart data
        const chartData = logs
          .map((log) => ({
            date: new Date(log.date).toLocaleDateString(),
            Mood: log.mood,
            "Sleep Hours": log.sleepHours || 0,
            "Energy Level": log.energyLevel,
          }))
          .reverse(); // so oldest first

        setData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // eslint-disable-next-line
  }, []);

  if (loading) return <p>Loading wellness trends...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data.length) return <p>No wellness data to show.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Mood" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Sleep Hours" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Energy Level" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
}
