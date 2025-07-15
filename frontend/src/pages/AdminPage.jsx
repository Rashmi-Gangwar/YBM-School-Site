import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("https://ybm-school-site.onrender.com/api/v1/admin", {
        withCredentials: true,
      })
      .then((res) => setUsers(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://ybm-school-site.onrender.com/api/v1/admin/${id}`,
        {
          withCredentials: true,
        }
      );
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Submitted Registration</h2>

      <div className="user-cards">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <button
              className="delete-button"
              onClick={() => handleDelete(user._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
