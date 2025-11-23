import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./Logs.css";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/logs");
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatMeta = (meta) => {
    if (!meta || Object.keys(meta).length === 0) return "-";
    return Object.entries(meta).map(([key, value]) => (
      <div key={key} className="meta-item">
        <strong>{key}:</strong> {value}
      </div>
    ));
  };

  // Safe array check
  const logsList = Array.isArray(logs) ? logs : [];

  if (loading) {
    return <div className="card text-center">Loading logs...</div>;
  }

  return (
    <div className="logs">
      <div className="flex justify-between items-center mb-4">
        <h2>Audit Logs</h2>
        <button onClick={fetchLogs} className="btn btn-primary">
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="logs-table">
          <div className="logs-header">
            <div>Action</div>
            <div>User</div>
            <div>Details</div>
            <div>Timestamp</div>
          </div>
          {logsList.map((log) => (
            <div key={log.id} className="logs-row">
              <div className="action-cell">
                <span className={`action-badge action-${log.action}`}>
                  {formatAction(log.action)}
                </span>
              </div>
              <div className="user-cell">{log.user_name || "System"}</div>
              <div className="meta-cell">{formatMeta(log.meta)}</div>
              <div className="time-cell">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {logsList.length === 0 && (
        <div className="card text-center">
          <p>No logs found</p>
        </div>
      )}
    </div>
  );
};

export default Logs;
