import React, { useState } from "react";
import Employees from "./Employees";
import Teams from "./Teams";
import Logs from "./Logs";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("employees");

  const tabs = [
    { id: "employees", label: "Employees" },
    { id: "teams", label: "Teams" },
    { id: "logs", label: "Audit Logs" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "employees":
        return <Employees />;
      case "teams":
        return <Teams />;
      case "logs":
        return <Logs />;
      default:
        return <Employees />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <h1>HRMS Dashboard</h1>
            <button onClick={onLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="container">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;
