import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get("/employees");
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
      setEmployees([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, formData);
      } else {
        await api.post("/employees", formData);
      }
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({ first_name: "", last_name: "", email: "", phone: "" });
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert(error.response?.data?.message || "Failed to save employee");
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setFormData({ first_name: "", last_name: "", email: "", phone: "" });
  };

  const employeesList = Array.isArray(employees) ? employees : [];

  return (
    <div className="employees">
      <div className="flex justify-between items-center mb-4">
        <h2>Employees</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Employee"}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingEmployee ? "Update" : "Create"} Employee
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="card text-center">
          <p>Loading employees...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="employees-grid">
            {employeesList.map((employee) => (
              <div key={employee.id} className="card employee-card">
                <div className="employee-header">
                  <h4>
                    {employee.first_name} {employee.last_name}
                  </h4>
                  <div className="employee-actions">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="employee-details">
                  {employee.email && (
                    <p>
                      <strong>Email:</strong> {employee.email}
                    </p>
                  )}
                  {employee.phone && (
                    <p>
                      <strong>Phone:</strong> {employee.phone}
                    </p>
                  )}
                  <p>
                    <strong>Added:</strong>{" "}
                    {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {employeesList.length === 0 && !showForm && (
            <div className="card text-center">
              <p>No employees found. Add your first employee!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Employees;
