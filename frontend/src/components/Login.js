import React, { useState } from "react";
import api from "../services/api";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    orgName: "",
    adminName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          };

      const response = await api.post(endpoint, payload);
      localStorage.setItem("token", response.data.token);
      onLogin();
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? "Register Organisation" : "Login to HRMS"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="orgName"
                  placeholder="Organisation Name"
                  value={formData.orgName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="adminName"
                  placeholder="Admin Name"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
        <div className="auth-switch">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="btn btn-secondary"
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              marginTop: "15px",
            }}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
