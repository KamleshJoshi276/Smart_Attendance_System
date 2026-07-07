import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "../auth";
import { getStudents, deleteStudent } from "../api";

export default function StudentList() {

  const user = getCurrentUser();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

 useEffect(() => {
  loadStudents();
}, []);

async function loadStudents() {
  try {
    setLoading(true);

    const response = await getStudents();

    console.log("Students Data:", response.data);   // 👈 Ye line add karo

    setStudents(response.data);
    setFilteredStudents(response.data);

  } catch (error) {
    console.error(error);
    alert("Unable to load students.");
  } finally {
    setLoading(false);
  }
 }

  function handleSearch(value) {

    setSearch(value);

    const result = students.filter((student) =>

      student.name.toLowerCase().includes(value.toLowerCase()) ||

      student.student_id.toLowerCase().includes(value.toLowerCase())

    );

    setFilteredStudents(result);

  }

  async function handleDelete(id, name) {

    const ok = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!ok) return;

    try {

      await deleteStudent(id);

      await loadStudents();

      alert("Student deleted successfully.");

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Unable to delete student."
      );

    }

  }

  function handleLogout() {

    logout();

    navigate("/teacher/login");

  }

  return ( 
        <main className="page-card">

      <div className="top-bar">

        <div>
          <h1 className="section-title">
            Registered Students
          </h1>

          <p className="notice">
            Logged in as {user?.name} ({user?.identifier})
          </p>
        </div>

        <div className="action-row">

          <input
            type="text"
            placeholder="Search Student..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "250px"
            }}
          />

          <Link
            className="link-button secondary"
            to="/teacher/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="link-button secondary"
            to="/teacher/attendance"
          >
            Attendance
          </Link>

          <button
            className="secondary"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {loading ? (

        <div className="card">

          <h2>Loading Students...</h2>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="card">

          <h2>No Students Found</h2>

        </div>

      ) : (

        <div className="card-grid">

          {filteredStudents.map((student) => (

            <div
              className="card student-card"
              key={student.id}
            >

              <div className="student-row">

                <img
                  src={
                    student.profile_image ||
                    "/placeholder-avatar.png"
                  }
                  alt={student.name}
                  className="avatar"
                />

                <div style={{ flex: 1 }}>

                  <h3>{student.name}</h3>

                  <p>

                    <strong>ID :</strong>{" "}

                    {student.student_id}

                  </p>

                </div>

              </div>

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >

                <button
                 className="secondary"
                 onClick={() =>
                 navigate(`/teacher/edit-student/${student.id}`)
                 }
>
                   ✏ Edit
                 </button>
                <button
                  style={{
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() =>
                    handleDelete(
                      student.id,
                      student.name
                    )
                  }
                >
                  🗑 Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>

  );

}