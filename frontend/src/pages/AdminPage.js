import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    department_id: "",
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    role: "student",
    department_id: "",
  });

  // Fetch all users
  const fetchUsers = () => {
    api
      .get("/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditInputChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleCreateUser = (e) => {
    e.preventDefault();
    const endpoint =
      formData.role === "student" ? "/admin/students" : "/admin/professors";

    api
      .post(endpoint, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        alert("User created successfully!");
        setFormData({
          email: "",
          password: "",
          role: "student",
          department_id: "",
        });
        fetchUsers();
      })
      .catch((err) => alert(err.response?.data?.message || err.message));
  };

  const startEdit = (user) => {
    setEditUserId(user.user_id);
    setEditFormData({
      email: user.email || "",
      role: user.role,
      department_id:
        user.student_department_id || user.prof_department_id || "",
    });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    api
      .put(`/admin/users/${editUserId}`, editFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        alert("User updated successfully!");
        setEditUserId(null);
        fetchUsers();
      })
      .catch((err) => alert(err.response?.data?.message || err.message));
  };

  const toggleActive = (user_id) => {
    api
      .put(
        `/admin/users/${user_id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      .then(() => fetchUsers())
      .catch((err) => alert(err.response?.data?.message || err.message));
  };

  //  Layout provides the sidebar.
  return (
    <div>
      <section className="dashboard-hero" style={{ marginBottom: 24 }}>
        <h1>Manage Users</h1>
        <p>Admin view: create, edit, activate, or deactivate users.</p>
      </section>

      <section className="dashboard-panel" style={{ marginBottom: 24 }}>
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Create New User</h2>
        </div>
        <form
          onSubmit={handleCreateUser}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="form-input"
            style={{ flex: "1 1 200px" }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="form-input"
            style={{ flex: "1 1 150px" }}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-input"
            style={{ flex: "1 1 120px" }}
          >
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>

          <input
            type="number"
            name="department_id"
            placeholder="Dept ID"
            value={formData.department_id}
            onChange={handleInputChange}
            required
            className="form-input"
            style={{ flex: "1 1 100px" }}
          />

          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </form>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">All Users</h2>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>ID</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Role</th>
              <th style={{ padding: "10px" }}>Active</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{u.user_id}</td>
                <td style={{ padding: "10px" }}>{u.email}</td>
                <td style={{ padding: "10px" }}>{u.role}</td>
                <td style={{ padding: "10px" }}>
                  {u.is_active ? "Yes" : "No"}
                </td>

                <td style={{ padding: "10px" }}>
                  {editUserId === u.user_id ? (
                    <form
                      onSubmit={submitEdit}
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <input
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="Email"
                        className="form-input"
                        style={{ width: "150px" }}
                      />

                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditInputChange}
                        className="form-input"
                        style={{ width: "110px" }}
                      >
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                      </select>

                      <input
                        type="number"
                        name="department_id"
                        value={editFormData.department_id}
                        onChange={handleEditInputChange}
                        placeholder="Dept ID"
                        className="form-input"
                        style={{ width: "90px" }}
                      />

                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditUserId(null)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="btn btn-soft"
                        style={{ marginRight: "6px" }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(u.user_id)}
                        className={u.is_active ? "btn btn-danger" : "btn btn-primary"}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
