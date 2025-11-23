import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./Teams.css";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teamMembers, setTeamMembers] = useState({}); // Store team members by team ID
  const [showForm, setShowForm] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [assignmentData, setAssignmentData] = useState({
    employeeId: "",
  });

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await api.get("/teams");
      const teamsData = Array.isArray(response.data) ? response.data : [];
      setTeams(teamsData);

      // Fetch members for each team
      teamsData.forEach((team) => {
        if (team.employee_count > 0) {
          fetchTeamMembers(team.id);
        }
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Failed to fetch teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
      setEmployees([]);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    setLoadingMembers((prev) => ({ ...prev, [teamId]: true }));
    try {
      const response = await api.get(`/teams/${teamId}/members`);
      setTeamMembers((prev) => ({
        ...prev,
        [teamId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      console.error(`Error fetching members for team ${teamId}:`, error);
      setTeamMembers((prev) => ({
        ...prev,
        [teamId]: [],
      }));
    } finally {
      setLoadingMembers((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/teams", formData);
      setShowForm(false);
      setFormData({ name: "", description: "" });
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${selectedTeam.id}/assign`, assignmentData);
      setShowAssignment(false);
      setSelectedTeam(null);
      setAssignmentData({ employeeId: "" });

      if (selectedTeam.id) {
        fetchTeamMembers(selectedTeam.id);
      }
      fetchTeams();
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert(error.response?.data?.message || "Failed to assign employee");
    }
  };

  const handleUnassign = async (teamId, employeeId) => {
    try {
      await api.delete(`/teams/${teamId}/unassign`, {
        data: { employeeId },
      });

      fetchTeamMembers(teamId);
      fetchTeams();
    } catch (error) {
      console.error("Error unassigning employee:", error);
      alert("Failed to unassign employee");
    }
  };

  const getTeamMembers = (teamId) => {
    return teamMembers[teamId] || [];
  };

  const isMemberLoading = (teamId) => {
    return loadingMembers[teamId] || false;
  };

  const teamsList = Array.isArray(teams) ? teams : [];
  const employeesList = Array.isArray(employees) ? employees : [];

  return (
    <div className="teams">
      <div className="flex justify-between items-center mb-4">
        <h2>Teams</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Loading..." : "Create Team"}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>Create New Team</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showAssignment && selectedTeam && (
        <div className="card form-card">
          <h3>Assign Employee to {selectedTeam.name}</h3>
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label>Select Employee</label>
              <select
                value={assignmentData.employeeId}
                onChange={(e) =>
                  setAssignmentData({ employeeId: e.target.value })
                }
                required
              >
                <option value="">Choose an employee...</option>
                {employeesList.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Assign Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAssignment(false);
                  setSelectedTeam(null);
                }}
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
          <p>Loading teams...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="teams-grid">
            {teamsList.map((team) => {
              const members = getTeamMembers(team.id);
              const isLoading = isMemberLoading(team.id);

              return (
                <div key={team.id} className="card team-card">
                  <div className="team-header">
                    <h4>{team.name}</h4>
                    <span className="employee-count">
                      {team.employee_count || 0} members
                    </span>
                  </div>

                  {team.description && (
                    <p className="team-description">{team.description}</p>
                  )}

                  <div className="team-actions">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAssignment(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Assign Employee
                    </button>
                  </div>

                  <div className="team-members">
                    <h5>Team Members:</h5>

                    {isLoading ? (
                      <div className="loading-members">Loading members...</div>
                    ) : members.length > 0 ? (
                      <ul className="members-list">
                        {members.map((member) => (
                          <li key={member.id} className="team-member">
                            <div className="member-info">
                              <span className="member-name">
                                {member.first_name} {member.last_name}
                              </span>
                              {member.email && (
                                <span className="member-email">
                                  {member.email}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnassign(team.id, member.id)}
                              className="btn btn-danger btn-sm"
                              title="Remove from team"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : team.employee_count > 0 ? (
                      <div className="no-members-detailed">
                        <p>
                          No members loaded.{" "}
                          <button
                            onClick={() => fetchTeamMembers(team.id)}
                            className="btn-link"
                          >
                            Click to load
                          </button>
                        </p>
                      </div>
                    ) : (
                      <p className="no-members">No members assigned yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {teamsList.length === 0 && !showForm && (
            <div className="card text-center">
              <p>No teams found. Create your first team!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Teams;
